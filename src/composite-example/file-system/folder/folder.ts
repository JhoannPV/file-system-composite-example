import type { FileSystemItem } from "../..";

export class Folder implements FileSystemItem {
    private name: string;
    private children: FileSystemItem[] = [];

    constructor(name: string) {
        this.name = name;
    }

    add(item: FileSystemItem): void {
        this.children.push(item);
    }

    remove(item: FileSystemItem): void {
        this.children = this.children.filter(c => c !== item);
    }

    getName(): string { return this.name; }

    // Delega a sus hijos y acumula el resultado
    getSize(): number {
        return this.children.reduce((total, item) => total + item.getSize(), 0);
    }
}