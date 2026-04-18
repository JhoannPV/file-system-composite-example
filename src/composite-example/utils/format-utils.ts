export const formatSize = (size: number): string => {
    if (size < 1024) {
        return `${size} B`;
    }

    return `${Math.round(size / 1024)} KB`;
};

export const getFileExtension = (fileName: string): string => {
    const dotIndex = fileName.lastIndexOf(".");

    if (dotIndex <= 0 || dotIndex === fileName.length - 1) {
        return "sin extension";
    }

    return fileName.slice(dotIndex + 1).toLowerCase();
};
