import { File as CompositeFile } from "../file-system/file/file";
import { Folder } from "../file-system/folder/folder";
import type { ExplorerNode, SerializedNode } from "./types";

export const makeId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const createRoot = (): ExplorerNode => ({
    id: "root",
    name: "",
    type: "Carpeta",
    size: 0,
    node: new Folder(""),
    children: [],
});

export const serializeNode = (node: ExplorerNode): SerializedNode => ({
    id: node.id,
    name: node.name,
    type: node.type,
    size: node.size,
    children: node.children?.map(serializeNode),
});

export const deserializeNode = (node: SerializedNode): ExplorerNode => {
    if (node.type === "Carpeta") {
        const folderNode = new Folder(node.name);
        const children = (node.children ?? []).map(deserializeNode);

        for (const child of children) {
            folderNode.add(child.node);
        }

        return {
            id: node.id,
            name: node.name,
            type: "Carpeta",
            size: 0,
            node: folderNode,
            children,
        };
    }

    return {
        id: node.id,
        name: node.name,
        type: "Archivo",
        size: node.size,
        node: new CompositeFile(node.name, node.size),
    };
};

export const getNodeById = (node: ExplorerNode, nodeId: string): ExplorerNode | null => {
    if (node.id === nodeId) {
        return node;
    }

    if (node.type === "Archivo" || !node.children) {
        return null;
    }

    for (const child of node.children) {
        const found = getNodeById(child, nodeId);

        if (found) {
            return found;
        }
    }

    return null;
};

export const updateNodeById = (
    node: ExplorerNode,
    nodeId: string,
    updater: (target: ExplorerNode) => ExplorerNode
): ExplorerNode => {
    if (node.id === nodeId) {
        return updater(node);
    }

    if (node.type === "Archivo" || !node.children) {
        return node;
    }

    return {
        ...node,
        children: node.children.map((child) => updateNodeById(child, nodeId, updater)),
    };
};

export const removeNodeById = (node: ExplorerNode, nodeId: string): ExplorerNode => {
    if (node.type === "Archivo" || !node.children) {
        return node;
    }

    const nextChildren: ExplorerNode[] = [];

    for (const child of node.children) {
        if (child.id === nodeId) {
            continue;
        }

        nextChildren.push(removeNodeById(child, nodeId));
    }

    return {
        ...node,
        children: nextChildren,
    };
};

export const getValidPath = (rootNode: ExplorerNode, path: string[]): string[] => {
    let folder = rootNode;
    const validPath: string[] = [];

    for (const pathId of path) {
        const nextFolder = getNodeById(folder, pathId);

        if (!nextFolder || nextFolder.type === "Archivo") {
            break;
        }

        validPath.push(pathId);
        folder = nextFolder;
    }

    return validPath;
};

export const getNodeSize = (node: ExplorerNode): number => {
    if (node.type === "Archivo") {
        return node.size;
    }

    return (node.children ?? []).reduce((total, child) => total + getNodeSize(child), 0);
};
