import _ from 'lodash'

function deepCopy<T extends object>(object: T): T {
  return _.cloneDeep(object)
}

function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  return _.merge(target, source)
}

export { deepCopy, deepMerge }
