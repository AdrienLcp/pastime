/** A `Storage` held in memory, standing in for `localStorage` in tests. */
export const memoryStorage = (entries: Record<string, string>): Storage => {
  const items = new Map(Object.entries(entries))
  return {
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    get length() {
      return items.size
    },
    removeItem: (key) => {
      items.delete(key)
    },
    setItem: (key, value) => {
      items.set(key, value)
    }
  }
}

export const storedKeys = (storage: Storage): (string | null)[] =>
  Array.from({ length: storage.length }, (_, index) => storage.key(index))
