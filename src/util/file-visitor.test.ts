const mockFileVisitor = jest.fn(() => {})
const mockReaddir = jest.fn(async(filePath: string) => {
    switch (path.basename(filePath)) {
        case 'empty':
            return []
        case 'dir-one-to-five':
            return [ 'one', 'two', 'three', 'four', 'five' ]
        case 'dir-base':
            return [ 'dir-one-to-five', 'abc' ]
    }
})
const mockIsDirectory = jest.fn(async(filePath: string) => {
    return path.basename(filePath).startsWith('dir')
})

jest.mock('fs/promises', () => {
    const originalModule = jest.requireActual('fs/promises')

    return {
        __esModule: true,
        ...originalModule,
        readdir: mockReaddir
    }
})

jest.mock('./file', () => {
    const originalModule = jest.requireActual('./file')

    return {
        __esModule: true,
        ...originalModule,
        isDirectory: mockIsDirectory
    }
})

import * as path from "path";
import { visitFiles } from "./file-visitor";

afterEach(() => {
    jest.clearAllMocks()
})

it('empty directory never calls visit', async() => {
    await visitFiles('empty', mockFileVisitor)
    expect(mockFileVisitor).toHaveBeenCalledTimes(0)
})

it('ignored directory not read', async() => {
    await visitFiles('ignored', mockFileVisitor, { dir: [ 'ignored' ]})
    expect(mockReaddir).toHaveBeenCalledTimes(0)
    expect(mockFileVisitor).toHaveBeenCalledTimes(0)
})

it('file visitor called for each file', async() => {
    await visitFiles('dir-one-to-five', mockFileVisitor)
    expect(mockReaddir).toHaveBeenCalledWith('dir-one-to-five')
    expect(mockFileVisitor).toHaveBeenCalledTimes(5)
    expect(mockFileVisitor).toHaveBeenNthCalledWith(1, path.join('dir-one-to-five', 'one'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(2, path.join('dir-one-to-five', 'two'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(3, path.join('dir-one-to-five', 'three'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(4, path.join('dir-one-to-five', 'four'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(5, path.join('dir-one-to-five', 'five'))
})

it('multi-level directory traversed correctly', async() => {
    await visitFiles('dir-base', mockFileVisitor, { path: [ 'dir-base/dir-one-to-five/five' ] })
    expect(mockReaddir).toHaveBeenCalledTimes(2)
    expect(mockReaddir).toHaveBeenCalledWith('dir-base')
    expect(mockReaddir).toHaveBeenCalledWith(path.join('dir-base', 'dir-one-to-five'))
    expect(mockFileVisitor).toHaveBeenCalledTimes(5)
    expect(mockFileVisitor).toHaveBeenNthCalledWith(1, path.join('dir-base', 'abc'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(2, path.join('dir-base', 'dir-one-to-five', 'one'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(3, path.join('dir-base', 'dir-one-to-five', 'two'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(4, path.join('dir-base', 'dir-one-to-five', 'three'))
    expect(mockFileVisitor).toHaveBeenNthCalledWith(5, path.join('dir-base', 'dir-one-to-five', 'four'))
})