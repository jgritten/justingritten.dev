import type { FileNode } from "@/types/fileNode";

type FileTreeProps = {
    nodes: FileNode[],
    parentPath: string,
    expanded: Set<string>,
    onToggle: (path: string) => void
}

export function FileTree({ nodes, parentPath, expanded, onToggle }: FileTreeProps) {
    return (
        <ul>
            {nodes.map((node) => {
                const isFolder = node.type === 'directory';
                const path = parentPath ? parentPath + '/' + node.name : node.name;
                const isExpanded = isFolder ? expanded.has(path) : false;

                return (
                    <li key={path}>
                        {isFolder && <button onClick={() => onToggle(path)}>{isExpanded ? '▲' : '▼'}</button> }
                        <span>{node.name}</span>
                        {isFolder && isExpanded && (
                            <FileTree nodes={node.children ?? []} parentPath={path} expanded={expanded} onToggle={onToggle}  />
                        )}
                    </li>
                )
            })}
        </ul>
    )
}