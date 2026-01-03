export const flattenNames = (arr?: { name: string }[]) => (Array.isArray(arr) ? arr.map(i => i.name).join(', ') : '')
