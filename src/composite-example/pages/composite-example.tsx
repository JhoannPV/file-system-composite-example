import { useEffect, useMemo, useState } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { File as CompositeFile } from "../file-system/file/file";
import { Folder } from "../file-system/folder/folder";
import { formatSize, getFileExtension } from "../utils/format-utils";
import { loadTreeFromSessionStorage, saveTreeToSessionStorage } from "../utils/storage-utils";
import {
    getNodeById,
    getNodeSize,
    getValidPath,
    makeId,
    removeNodeById,
    updateNodeById,
} from "../utils/tree-utils";
import type { ExplorerNode } from "../utils/types";
import {
    ArrowLeft,
    ChevronRight,
    FileText,
    FolderOpen,
    HardDrive,
} from "lucide-react";

export const CompositeExample = () => {
    const [root, setRoot] = useState<ExplorerNode>(() => loadTreeFromSessionStorage());
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");

    useEffect(() => {
        saveTreeToSessionStorage(root);
    }, [root]);

    const currentFolder = useMemo(() => {
        let folder = root;

        for (const pathId of currentPath) {
            const nextFolder = getNodeById(folder, pathId);

            if (!nextFolder || nextFolder.type === "Archivo") {
                break;
            }

            folder = nextFolder;
        }

        return folder;
    }, [root, currentPath]);

    const breadcrumbNodes = useMemo(() => {
        const nodes: ExplorerNode[] = [];
        let folder = root;

        for (const pathId of currentPath) {
            const nextFolder = getNodeById(folder, pathId);

            if (!nextFolder || nextFolder.type === "Archivo") {
                break;
            }

            nodes.push(nextFolder);
            folder = nextFolder;
        }

        return nodes;
    }, [root, currentPath]);

    const items = currentFolder.children ?? [];

    const addFolder = () => {
        const index = items.filter((item) => item.type === "Carpeta").length + 1;
        const folderName = `Nueva carpeta ${index}`;
        const folderNode = new Folder(folderName);
        const newFolder: ExplorerNode = {
            id: makeId(),
            name: folderName,
            type: "Carpeta",
            size: 0,
            node: folderNode,
            children: [],
        };

        setRoot((prevRoot) =>
            updateNodeById(prevRoot, currentFolder.id, (target) => {
                if (target.type === "Archivo") {
                    return target;
                }

                return {
                    ...target,
                    children: [...(target.children ?? []), newFolder],
                };
            })
        );
    };

    const addFile = () => {
        const index = items.filter((item) => item.type === "Archivo").length + 1;
        const fileName = `Nuevo archivo ${index}.txt`;
        const fileNode = new CompositeFile(fileName, 1024);
        const newFile: ExplorerNode = {
            id: makeId(),
            name: fileName,
            type: "Archivo",
            size: fileNode.getSize(),
            node: fileNode,
        };

        setRoot((prevRoot) =>
            updateNodeById(prevRoot, currentFolder.id, (target) => {
                if (target.type === "Archivo") {
                    return target;
                }

                return {
                    ...target,
                    children: [...(target.children ?? []), newFile],
                };
            })
        );
    };

    const openRenameDialog = (itemId: string) => {
        const item = items.find((entry) => entry.id === itemId);

        if (!item) {
            return;
        }

        setRenameTargetId(item.id);
        setNewItemName(item.name);
    };

    const closeRenameDialog = () => {
        setRenameTargetId(null);
        setNewItemName("");
    };

    const applyRename = () => {
        const trimmedName = newItemName.trim();

        if (!renameTargetId || !trimmedName) {
            return;
        }

        setRoot((prevRoot) =>
            updateNodeById(prevRoot, renameTargetId, (target) => {
                if (target.node instanceof Folder) {
                    target.node.rename(trimmedName);
                }

                if (target.node instanceof CompositeFile) {
                    target.node.rename(trimmedName);
                }

                return {
                    ...target,
                    name: trimmedName,
                };
            })
        );

        closeRenameDialog();
    };

    const deleteItem = (itemId: string) => {
        const nextRoot = removeNodeById(root, itemId);

        setRoot(nextRoot);
        setCurrentPath((prevPath) => getValidPath(nextRoot, prevPath));

        if (renameTargetId === itemId) {
            closeRenameDialog();
        }
    };

    const renameTarget = items.find((item) => item.id === renameTargetId);
    const globalRenameTarget = renameTarget ?? getNodeById(root, renameTargetId ?? "");
    const renameTargetTypeLabel = globalRenameTarget?.type === "Archivo" ? "archivo" : "carpeta";

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] p-4 md:p-8">
            <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/80 shadow-[0_25px_85px_-35px_rgba(0,0,0,0.9)] backdrop-blur-sm">
                <div className="border-b border-slate-700/80 bg-linear-to-r from-slate-900 to-slate-800 px-4 py-4 md:px-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        {currentPath.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setCurrentPath((prev) => prev.slice(0, -1))}
                                className="inline-flex items-center justify-center rounded-md p-1 text-slate-300 transition hover:bg-slate-800 hover:text-sky-300"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        )}
                        <HardDrive className="h-4 w-4 text-sky-400" />
                        <button
                            type="button"
                            onClick={() => setCurrentPath([])}
                            className="text-slate-300 transition hover:text-sky-300"
                        >
                            Este equipo
                        </button>
                        {breadcrumbNodes.map((node, index) => (
                            <div key={node.id} className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-slate-500" />
                                <button
                                    type="button"
                                    onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                                    className="text-slate-100 transition hover:text-sky-300"
                                >
                                    {node.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <section className="relative bg-slate-900 p-6 md:p-10">
                    <div className="mb-4 grid grid-cols-[1fr_130px_140px] border-b border-slate-700 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <span>Nombre</span>
                        <span>Tipo</span>
                        <span>Tamano</span>
                    </div>

                    <ContextMenu>
                        <ContextMenuTrigger className="grid min-h-[68vh] place-items-center rounded-2xl border border-dashed border-slate-700 bg-linear-to-br from-slate-900 to-slate-800 p-6 text-center">
                            {items.length === 0 ? (
                                <div className="max-w-sm">
                                    <div className="mx-auto mb-4 w-fit rounded-2xl border border-sky-900/50 bg-sky-950/40 p-4">
                                        <FolderOpen className="h-8 w-8 text-sky-400" />
                                    </div>
                                    <h1 className="text-2xl font-semibold text-slate-100 md:text-3xl">
                                        Carpeta vacia
                                    </h1>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                        Este FileSystem no tiene archivos en esta ubicacion.
                                        Puedes agregar elementos mas adelante.
                                    </p>
                                    <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-300">
                                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                                        Estado limpio
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full self-start">
                                    {items.map((item) => (
                                        item.type === "Carpeta" ? (
                                            <ContextMenu key={item.id}>
                                                <ContextMenuTrigger
                                                    onDoubleClick={() => setCurrentPath((prev) => [...prev, item.id])}
                                                    className="grid w-full grid-cols-[1fr_130px_140px] items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/70"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <FolderOpen className="h-4 w-4 text-sky-400" />
                                                        <span className="text-slate-200">
                                                            {item.name}
                                                        </span>
                                                    </span>
                                                    <span className="text-slate-500">-</span>
                                                    <span className="text-slate-400">{formatSize(getNodeSize(item))}</span>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent className="w-52 border-slate-700 bg-slate-900 text-slate-100 ring-1 ring-slate-700/80">
                                                    <ContextMenuGroup className="rounded-md bg-slate-900 p-1">
                                                        <ContextMenuItem
                                                            onSelect={() => openRenameDialog(item.id)}
                                                            className="px-2 py-1.5 text-slate-200 focus:bg-slate-800 focus:text-sky-300"
                                                        >
                                                            Renombrar
                                                        </ContextMenuItem>
                                                        <ContextMenuItem
                                                            onSelect={() => deleteItem(item.id)}
                                                            variant="destructive"
                                                            className="px-2 py-1.5"
                                                        >
                                                            Eliminar
                                                        </ContextMenuItem>
                                                    </ContextMenuGroup>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        ) : (
                                            <ContextMenu key={item.id}>
                                                <ContextMenuTrigger className="grid w-full grid-cols-[1fr_130px_140px] items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/70">
                                                    <span className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-emerald-400" />
                                                        {item.name}
                                                    </span>
                                                    <span className="text-slate-400">{getFileExtension(item.name)}</span>
                                                    <span className="text-slate-400">{formatSize(getNodeSize(item))}</span>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent className="w-52 border-slate-700 bg-slate-900 text-slate-100 ring-1 ring-slate-700/80">
                                                    <ContextMenuGroup className="rounded-md bg-slate-900 p-1">
                                                        <ContextMenuItem
                                                            onSelect={() => openRenameDialog(item.id)}
                                                            className="px-2 py-1.5 text-slate-200 focus:bg-slate-800 focus:text-sky-300"
                                                        >
                                                            Renombrar
                                                        </ContextMenuItem>
                                                        <ContextMenuItem
                                                            onSelect={() => deleteItem(item.id)}
                                                            variant="destructive"
                                                            className="px-2 py-1.5"
                                                        >
                                                            Eliminar
                                                        </ContextMenuItem>
                                                    </ContextMenuGroup>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        )
                                    ))}
                                </div>
                            )}
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-52 border-slate-700 bg-slate-900 text-slate-100 ring-1 ring-slate-700/80">
                            <ContextMenuGroup className="rounded-md bg-slate-900 p-1">
                                <ContextMenuItem onSelect={addFolder} className="px-2 py-1.5 text-slate-200 focus:bg-slate-800 focus:text-sky-300">
                                    Anadir carpeta
                                </ContextMenuItem>
                                <ContextMenuItem onSelect={addFile} className="px-2 py-1.5 text-slate-200 focus:bg-slate-800 focus:text-sky-300">
                                    Anadir archivo
                                </ContextMenuItem>
                            </ContextMenuGroup>
                        </ContextMenuContent>
                    </ContextMenu>

                    <Dialog
                        open={renameTargetId !== null}
                        onOpenChange={(open: boolean) => {
                            if (!open) {
                                closeRenameDialog();
                            }
                        }}
                    >
                        <DialogContent className="border-slate-700 bg-slate-900 text-slate-100 ring-1 ring-slate-700/80">
                            <DialogHeader>
                                <DialogTitle className="text-slate-100">Renombrar {renameTargetTypeLabel}</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Escribe el nuevo nombre y guarda el cambio.
                                </DialogDescription>
                            </DialogHeader>

                            <Input
                                value={newItemName}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewItemName(event.target.value)}
                                placeholder={`Nombre de ${renameTargetTypeLabel}`}
                                className="border-slate-700 bg-slate-800 text-slate-100"
                                autoFocus
                            />

                            <DialogFooter className="border-slate-700 bg-slate-900/90">
                                <button
                                    type="button"
                                    onClick={closeRenameDialog}
                                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-700 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={applyRename}
                                    disabled={newItemName.trim().length === 0}
                                    className="inline-flex h-9 items-center justify-center rounded-md bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-500"
                                >
                                    Guardar
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </section>
            </section>
        </main>
    );
};