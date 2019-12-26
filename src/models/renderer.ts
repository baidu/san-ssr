export interface Renderer {
    (data: { [key: string]: any }, noDataOutput?: boolean): string
}
