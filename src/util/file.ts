import { stat, mkdir, open } from "fs/promises";

export const isDirectory = async(path: string) => {
    return await getFileType(path) === 'directory'
}

export const writeFile = async(path: string, data: string) => {
    const file = await open(path, 'w')
    try {
        await file.writeFile(data)
    } finally {
        await file.close()
    }
}

export const ensureDirectoryExists = async(path: string) => {
    switch (await getFileType(path)) {
        case 'directory':
            break
        case 'file':
            throw new Error(`Non-directory file already exists at path '${path}'`)
        case 'missing':
            await mkdir(path)
            break
    }
}

const getFileType = async(path: string) => {
    try {
        const fileStat = await stat(path)
        return fileStat.isDirectory() ? 'directory' : 'file'
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return 'missing'
    }
}