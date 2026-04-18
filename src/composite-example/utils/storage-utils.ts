import type { ExplorerNode, SerializedNode } from "./types";
import { createRoot, deserializeNode, serializeNode } from "./tree-utils";

export const STORAGE_KEY = "composite-example-session-tree";

export const loadTreeFromSessionStorage = (): ExplorerNode => {
    if (typeof window === "undefined") {
        return createRoot();
    }

    const rawTree = window.sessionStorage.getItem(STORAGE_KEY);

    if (!rawTree) {
        return createRoot();
    }

    try {
        return deserializeNode(JSON.parse(rawTree) as SerializedNode);
    } catch {
        return createRoot();
    }
};

export const saveTreeToSessionStorage = (root: ExplorerNode): void => {
    if (typeof window === "undefined") {
        return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializeNode(root)));
};
