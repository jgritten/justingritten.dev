import { mockAPI } from "@/lib/mockAPI";
import { useCallback, useEffect, useState } from "react";
import type { FileNode } from "@/types/fileNode";

export interface fileNodesResult {
    nodes: FileNode[]
    isLoading: boolean
    error: Error | null
    refresh: () => void
}

export function useFileNodes(): fileNodesResult {
    const [fileNodes, setFileNodes] = useState<FileNode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchFileNodes = useCallback(() => {
        setLoading(true);
        setError(null);
        setTimeout(() => {
            const data = mockAPI.getFileNodes();
            setFileNodes(data);
            setLoading(false);
        }, 1000);
    }, [])

    useEffect(() => {
        fetchFileNodes();
    }, [fetchFileNodes])

    return { nodes: fileNodes, isLoading: loading, error, refresh: fetchFileNodes }
}