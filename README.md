# File System Composite Example

Proyecto academico para practicar el patron Composite modelando un sistema de archivos (File + Folder) y una interfaz tipo explorador.

## Objetivo

Construir una simulacion de File System donde:

1. `File` y `Folder` implementan la misma interfaz (`FileSystemItem`).
2. `Folder` puede contener elementos anidados (`File` y otras `Folder`).
3. La UI permite crear, renombrar, eliminar y navegar sobre esa estructura.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Context Menu, Dialog, Input)
- Radix UI
- React Router

## Estructura Relevante

- `src/composite-example/file-system/file-system-item/file-system-item.ts`
  Define la interfaz base `FileSystemItem`.

- `src/composite-example/file-system/file/file.ts`
  Implementacion de `File` (nombre, tamano, rename, getSize).

- `src/composite-example/file-system/folder/folder.ts`
  Implementacion de `Folder` (children, add, remove, rename, getSize acumulado).

- `src/composite-example/pages/composite-example.tsx`
  Vista principal del explorador (dark mode), interacciones y render.

- `src/composite-example/utils/types.ts`
  Tipos compartidos del arbol (`ExplorerNode`, `SerializedNode`).

- `src/composite-example/utils/tree-utils.ts`
  Helpers del arbol: busqueda, actualizacion, borrado, serializacion y calculo de tamano.

- `src/composite-example/utils/storage-utils.ts`
  Persistencia temporal en `sessionStorage`.

- `src/composite-example/utils/format-utils.ts`
  Formato de tamano y extension de archivo.

## Funcionalidades Implementadas

- Crear carpeta y archivo con context menu.
- Renombrar carpeta y archivo con dialog + input.
- Eliminar carpeta y archivo con context menu.
- Navegacion anidada:
  - `Este equipo` regresa a raiz.
  - Flecha volver al nivel anterior.
  - Doble clic en fila de carpeta para entrar.
  - Breadcrumb navegable.
- Columna `Tipo`:
  - En archivos muestra extension.
  - En carpetas muestra `-`.
- Columna `Tamano`:
  - En archivos muestra tamano individual.
  - En carpetas muestra tamano acumulado de hijos.
- Persistencia de sesion:
  - Se conserva mientras la pestana/navegador este abierto.
  - Al cerrar el navegador, se pierde el estado.

## Scripts

```bash
deno task dev
```

Otros scripts:

```bash
deno task build
deno task preview
deno task lint
```

## Notas de Diseno

- Se usa `sessionStorage` en lugar de `localStorage` para no persistir datos al cerrar el navegador.
- La logica se separo en `utils` para mejorar legibilidad y mantenimiento.
- El modelo Composite (`File` / `Folder`) se mantiene como base conceptual del dominio.

## Estado

Este proyecto esta orientado a demostracion del patron Composite en frontend, no a uso productivo como gestor real de archivos.
