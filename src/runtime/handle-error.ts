import type { SanComponent } from 'san'

export function handleError (e: Error, instance: SanComponent<{}>, info: string) {
    let current: SanComponent<{}> | undefined = instance
    while (current) {
        if (typeof current.error === 'function') {
            current.error(e, instance, info)
            return
        }
        current = current.parentComponent
    }

    throw e
}
