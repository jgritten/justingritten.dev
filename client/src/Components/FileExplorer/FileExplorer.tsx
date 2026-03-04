import { useCallback, useState } from "react"
import type { FileNode } from "@/types/fileNode";
import { FileTree } from "./FileTree";
import { useFileNodes } from "@/hooks/useFileNodes";

export function FileExplorer() {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())
    const { nodes, isLoading, error, refresh } = useFileNodes();

    const handleToggle = useCallback((path: string) => {
        setExpanded(prev => {
            const newSet = new Set(prev)
            newSet.has(path) ? newSet.delete(path) : newSet.add(path)
            return newSet
        })
    }, [])
    
    return (
        <div>
            <h1>File Explorer</h1>
            {isLoading && <div>
                <h1>Is Loading</h1>
            </div>
            }
            {error && <div><h1>Error Occurred</h1></div>}
            {!isLoading && !error && nodes.length > 0 && <div>
                <button onClick={refresh}>Refresh</button>
                <FileTree nodes={nodes} parentPath="" expanded={expanded} onToggle={handleToggle}  />
                </div>
                }
            
        </div>
    )
}

export default FileExplorer