import type { File as CompositeFile } from "../file-system/file/file";
import type { Folder } from "../file-system/folder/folder";

export type ExplorerNode = {
    id: string;
    name: string;
    type: "Carpeta" | "Archivo";
    size: number;
    node: Folder | CompositeFile;
    children?: ExplorerNode[];
};

export type SerializedNode = {
    id: string;
    name: string;
    type: "Carpeta" | "Archivo";
    size: number;
    children?: SerializedNode[];
};
