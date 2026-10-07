import { useLayoutEffect, useRef, useState } from 'react'

export type ElementSize = { readonly width: number; readonly height: number }

/** The element's content box, measured before the first paint and on every resize. */
export const useElementSize = <Element extends HTMLElement>() => {
  const ref = useRef<Element>(null)
  const [size, setSize] = useState<ElementSize | null>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (element === null) return
    const measure = () =>
      setSize((previous) => {
        const { clientHeight: height, clientWidth: width } = element
        return previous?.width === width && previous.height === height
          ? previous
          : { height, width }
      })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, size }
}
