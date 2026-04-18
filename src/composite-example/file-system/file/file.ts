import type { FileSystemItem } from "../..";

export class File implements FileSystemItem {
    private name: string;
    private size: number;

    constructor(name: string, size: number) {
        this.name = name;
        this.size = size;
    }

    getName(): string { return this.name; }
    getSize(): number { return this.size; }
}