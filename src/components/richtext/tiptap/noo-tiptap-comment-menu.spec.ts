import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, test } from 'vitest'
import { createApp, nextTick } from 'vue'
import { Comment } from './extensions/comment'
import NooTiptapCommentMenu from './noo-tiptap-comment-menu.vue'

const types = [{ key: 'factual', label: 'Фактическая ошибка', color: 'red' }]

let cleanUp: (() => void) | null = null

afterEach(() => {
  cleanUp?.()
  cleanUp = null
})

async function mountMenu() {
  const editor = new Editor({
    element: document.createElement('div'),
    editable: false,
    extensions: [StarterKit, Comment.configure({ types })],
    content: '<p>Наполеон</p>'
  })

  const host = document.createElement('div')

  document.body.append(host)

  const app = createApp(NooTiptapCommentMenu, { editor, types })

  app.mount(host)

  cleanUp = () => {
    app.unmount()
    host.remove()
    editor.destroy()
  }

  // The menu registers its plugin — and BubbleMenu detaches its own root — in a
  // nextTick of its own.
  await nextTick()
  await nextTick()

  return host
}

describe('comment bubble menu', () => {
  /**
   * BubbleMenu removes its own root element from the DOM as it mounts and
   * re-parents it beside the editor. Vue goes on using that vnode's element to
   * find the parent it should patch siblings into, so if it were this
   * component's root there would be no parent to find, and hiding the menu —
   * which happens the moment a comment type is picked — would throw mid-patch
   * and take the whole editor's subtree down with it.
   */
  test('should leave a root of its own behind for Vue to patch around', async () => {
    const host = await mountMenu()

    expect(host.childElementCount).toBe(1)
    expect(host.firstElementChild?.isConnected).toBe(true)
  })
})
