import { useEffect, DependencyList } from 'react'

export function UseDebounceEffect(
    fn,
    waitTime,
    deps,
) {
    useEffect(() => {
        const t = setTimeout(() => {
            fn.apply(undefined, deps)
        }, waitTime)

        return () => {
            clearTimeout(t)
        }
    }, deps)
}