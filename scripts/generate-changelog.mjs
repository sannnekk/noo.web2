#!/usr/bin/env node
/**
 * Generates `public/changelog.json` from the git history.
 *
 * Commits are grouped by the git tag they were released under, newest release
 * first. Only commits that classify into one of the four `ChangeType` values
 * understood by the API end up in the changelog; `chore`, `docs`, `test` and
 * friends are dropped.
 *
 * Usage:
 *   node scripts/generate-changelog.mjs             # released tags only
 *   node scripts/generate-changelog.mjs 1.2.0-alpha # + unreleased as 1.2.0-alpha
 *
 * The output shape mirrors the API's `ChangeLogDTO` so the settings view can
 * render the frontend and the API changelog with the same component.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** Conventional commit types that map onto the API's `ChangeType` enum. */
const CHANGE_TYPES = {
  feat: 'feature',
  fix: 'bug-fix',
  perf: 'optimization',
  refactor: 'refactor'
}

/** Valid commit types that are intentionally kept out of the changelog. */
const SILENT_TYPES = new Set(['chore', 'docs', 'test', 'style', 'ci', 'build'])

/**
 * Fallback for commits written before the conventional-commit convention was
 * adopted. The old history is consistent enough about its leading verb that
 * this recovers almost every entry.
 */
const LEGACY_VERBS = [
  [/^added\b/i, 'feature'],
  [/^implemented\b/i, 'feature'],
  [/^fixed\b/i, 'bug-fix'],
  [/^improved\b/i, 'optimization'],
  [/^optimi[sz]ed\b/i, 'optimization'],
  [/^refactored\b/i, 'refactor']
]

/** Order changes are listed in within a single release. */
const TYPE_ORDER = ['feature', 'bug-fix', 'optimization', 'refactor']

const CONVENTIONAL_PATTERN = /^([a-z]+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/

const FIELD_SEPARATOR = '\x1f'

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trimEnd()
}

/**
 * Turns a commit subject into a changelog entry, or `null` when the commit
 * should not appear in the changelog at all.
 */
function classify(subject) {
  const conventional = CONVENTIONAL_PATTERN.exec(subject)

  if (conventional) {
    const [, type, scope, , description] = conventional

    if (SILENT_TYPES.has(type) || !CHANGE_TYPES[type]) {
      return null
    }

    return {
      type: CHANGE_TYPES[type],
      description: scope ? `${scope}: ${description}` : description
    }
  }

  for (const [pattern, type] of LEGACY_VERBS) {
    if (pattern.test(subject)) {
      return { type, description: subject }
    }
  }

  return null
}

/** Reads the commits in `range` and returns their changelog entries. */
function collectChanges(range) {
  const log = git(
    'log',
    '--no-merges',
    `--format=%an${FIELD_SEPARATOR}%s`,
    range
  )

  if (!log) {
    return []
  }

  const changes = []

  for (const line of log.split('\n')) {
    const [author, subject] = line.split(FIELD_SEPARATOR)
    const change = classify(subject ?? '')

    if (change) {
      changes.push({ ...change, author })
    }
  }

  return changes.sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
  )
}

/** Tags oldest-first. Lightweight tags make `creatordate` the commit date. */
function listTags() {
  const tags = git('tag', '--list', '--sort=creatordate')

  return tags ? tags.split('\n') : []
}

function releaseDate(ref) {
  return git('log', '-1', '--format=%aI', ref)
}

/** Strips the `v` prefix so versions match what the API reports. */
function toVersion(tag) {
  return tag.replace(/^v/, '')
}

function build(unreleasedVersion) {
  const tags = listTags()
  const releases = []

  tags.forEach((tag, index) => {
    const previous = tags[index - 1]
    const range = previous ? `${previous}..${tag}` : tag
    const changes = collectChanges(range)

    if (changes.length > 0) {
      releases.push({
        version: toVersion(tag),
        date: releaseDate(tag),
        changes
      })
    }
  })

  if (unreleasedVersion) {
    const lastTag = tags.at(-1)
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD'
    const changes = collectChanges(range)

    if (changes.length > 0) {
      releases.push({
        version: toVersion(unreleasedVersion),
        date: releaseDate('HEAD'),
        changes
      })
    }
  }

  return releases.reverse()
}

const root = git('rev-parse', '--show-toplevel')
const outputPath = join(root, 'public', 'changelog.json')
const releases = build(process.argv[2])

writeFileSync(outputPath, `${JSON.stringify(releases, null, 2)}\n`, 'utf8')

const total = releases.reduce((sum, item) => sum + item.changes.length, 0)

// eslint-disable-next-line no-console
console.log(
  `changelog.json: ${releases.length} release(s), ${total} change(s) -> ${outputPath}`
)
