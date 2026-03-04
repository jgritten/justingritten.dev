import type { FileNode } from "@/types/fileNode";

function getFileNodes(): FileNode[] {
    return [
        {
            name: 'root',
            type: 'directory',
            children: [
                {
                    name: 'src',
                    type: 'directory',
                    children: [
                        {
                            name: 'components',
                            type: 'directory',
                            children: [
                                {
                                    name: 'App.tsx',
                                    type: 'file',
                                    content: 'Root React component'
                                },
                                {
                                    name: 'Header.tsx',
                                    type: 'file',
                                    content: 'Header layout component'
                                }
                            ]
                        },
                        {
                            name: 'index.tsx',
                            type: 'file',
                            content: 'Application entry point'
                        }
                    ]
                },
                {
                    name: 'README.md',
                    type: 'file',
                    content: 'Project overview'
                }
            ]
        }
    ]
}

export const mockAPI = {
    getFileNodes
}