const mockMkDir = jest.fn(async() => {})
const mockStat = jest.fn(async(path: string) => {
    switch(path) {
        case 'missing':
            throw new Error('Missing path: ' + path)
        case 'file':
            return {
                isDirectory: () => false
            }
        case 'directory':
            return {
                isDirectory: () => true
            }
    }
})
const mockWriteFile = jest.fn(async() => {})
const mockClose = jest.fn(async() => {})
const mockOpen = jest.fn(async() => {
    return {
        writeFile: mockWriteFile,
        close: mockClose
    }
})

jest.mock('fs/promises', () => {
    const originalModule = jest.requireActual('fs')

    return {
        __esModule: true,
        ...originalModule,
        stat: mockStat,
        mkdir: mockMkDir,
        open: mockOpen
    }
})

import { ensureDirectoryExists, isDirectory, writeFile } from "./file";

afterEach(() => {
    jest.clearAllMocks()
})

describe('isDirectory', () => {
    it('missing path returns false', async() => {
        expect(await isDirectory('missing')).toBe(false)
    })

    it('non-directory file returns false', async() => {
        expect(await isDirectory('file')).toBe(false)
    })

    it('found directory returns true', async() => {
        expect(await isDirectory('directory')).toBe(true)
    })
})

describe('ensureDirectoryExists', () => {
    it('missing path creates directory', async() => {
        await ensureDirectoryExists('missing')
        expect(mockMkDir).toHaveBeenCalledWith('missing')
    })

    it('existing non-directory throws', async() => {
        await expect(async() => ensureDirectoryExists('file')).rejects.toThrow()
    })

    it('existing directory does nothing', async() => {
        await ensureDirectoryExists('directory')
        expect(mockMkDir).toHaveBeenCalledTimes(0)
    })
})

it('writeFile writes and closes', async() => {
    await writeFile('new-file', 'file data')
    expect(mockOpen).toHaveBeenCalledWith('new-file', 'w')
    expect(mockWriteFile).toHaveBeenCalledWith('file data')
    expect(mockClose).toHaveBeenCalledTimes(1)
})