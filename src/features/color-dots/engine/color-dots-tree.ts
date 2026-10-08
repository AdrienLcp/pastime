import type { ColorDotsLink } from './color-dots-level'

/** Where the nodes sit and how lines join them: what a route is walked on. */
export type ColorDotsTree = {
  readonly nodes: readonly { readonly x: number; readonly y: number }[]
  readonly links: readonly ColorDotsLink[]
}

const neighbourLists = new WeakMap<ColorDotsTree, readonly number[][]>()

export const neighboursOf = (tree: ColorDotsTree): readonly number[][] => {
  const known = neighbourLists.get(tree)
  if (known !== undefined) return known
  const lists = tree.nodes.map((): number[] => [])
  for (const [from, to] of tree.links) {
    lists[from]?.push(to)
    lists[to]?.push(from)
  }
  neighbourLists.set(tree, lists)
  return lists
}

/**
 * The only way from one node to another, both ends included: a tree has no
 * second one.
 */
export const routeBetween = ({
  from,
  to,
  tree
}: {
  tree: ColorDotsTree
  from: number
  to: number
}): readonly number[] => {
  const neighbours = neighboursOf(tree)
  const cameFrom = new Map<number, number>([[from, from]])
  const waiting = [from]
  for (let node = waiting.pop(); node !== undefined; node = waiting.pop()) {
    if (node === to) break
    for (const next of neighbours[node] ?? []) {
      if (cameFrom.has(next)) continue
      cameFrom.set(next, node)
      waiting.push(next)
    }
  }
  const route = [to]
  for (let node = to; node !== from; ) {
    const previous = cameFrom.get(node)
    if (previous === undefined) return []
    route.push(previous)
    node = previous
  }
  return route.toReversed()
}

/** How far a ball travels along a route, in grid steps. */
export const routeLength = ({
  route,
  tree
}: {
  tree: ColorDotsTree
  route: readonly number[]
}): number =>
  route.reduce((length, node, index) => {
    const here = tree.nodes[node]
    const next = tree.nodes[route[index + 1] ?? node]
    if (here === undefined || next === undefined) return length
    return length + Math.abs(next.x - here.x) + Math.abs(next.y - here.y)
  }, 0)
