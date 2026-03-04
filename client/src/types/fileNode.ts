export type FileNode = {
    name: string
    type: 'file' | 'directory'
    content?: string
    children?: FileNode[]
}