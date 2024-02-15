const mockExistsSync = jest.fn()
const mockYamlStringify = jest.fn(() => 'final yaml')
const mockEnsureDirectoryExists = jest.fn()
const mockIsDirectory = jest.fn()
const mockWriteFile = jest.fn()
// eslint-disable-next-line  @typescript-eslint/no-unused-vars
const mockCreate = jest.fn(async(_) => {
    return { version: 2, updates: [] as Update[] }
})

jest.mock('fs', () => {
    const originalModule = jest.requireActual('fs')

    return {
        __esModule: true,
        ...originalModule,
        default: {
            existsSync: mockExistsSync
        }
    }
})

jest.mock('yaml', () => {
    const originalModule = jest.requireActual('yaml')

    return {
        __esModule: true,
        ...originalModule,
        stringify: mockYamlStringify
    }
})

jest.mock('../util/file', () => {
    const originalModule = jest.requireActual('../util/file')

    return {
        __esModule: true,
        ...originalModule,
        ensureDirectoryExists: mockEnsureDirectoryExists,
        isDirectory: mockIsDirectory,
        writeFile: mockWriteFile
    }
})

jest.mock('../dependabot/config', () => {
    const originalModule = jest.requireActual('../dependabot/config')

    return {
        __esModule: true,
        ...originalModule,
        create: mockCreate
    }
})

import { CreateCommandParams } from "../types/CreateCommandParams.interface";
import { Update } from "../types/DependabotUpdate.interface";
import { createDependabotConfig } from "./create";

afterEach(() => {
    jest.clearAllMocks()
})

it('no .git folder throws error', async() => {
    mockIsDirectory.mockImplementation((path: string) => path !== '.git')
    await expect(async() => createDependabotConfig({}))
        .rejects.toThrow('Current directory is not the root of a Git repository')
})

it('dependabot.yml already exists throws error', async() => {
    mockIsDirectory.mockImplementation(() => true)
    mockExistsSync.mockImplementation((path: string) => path === '.github/dependabot.yml')
    await expect(async() => createDependabotConfig({}))
        .rejects.toThrow('Dependabot configuration file \'.github/dependabot.yml\' already exists')
})

it('create uses supplied params', async() => {
    mockIsDirectory.mockImplementation(() => true)
    mockExistsSync.mockImplementation(() => false)
    const createParams: CreateCommandParams = {
        packageEcosystem: [ 'npm' ],
        schedule: {
            interval: 'weekly'
        },
        ignore: {
            dir: [ 'abc' ],
            path: [ '123' ]
        }
    }
    await createDependabotConfig(createParams)
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate.mock.calls[0][0]).toStrictEqual({
        ...createParams,
        ignore: {
            ...createParams.ignore,
            dir: [ 'abc', 'node_modules', '**/node_modules' ]
        }
    })
})

it('create fills in default full params', async() => {
    mockIsDirectory.mockImplementation(() => true)
    mockExistsSync.mockImplementation(() => false)
    await createDependabotConfig({})
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate.mock.calls[0][0]).toStrictEqual({
        packageEcosystem: [ 'github-actions', 'maven', 'npm', 'pip' ],
        schedule: {
            interval: 'monthly'
        },
        ignore: {
            dir: [ 'node_modules', '**/node_modules' ]
        }
    })
})

it('yaml-ized config written to dependabot.yml', async() => {
    mockIsDirectory.mockImplementation(() => true)
    mockExistsSync.mockImplementation(() => false)
    mockCreate.mockImplementation(async() => {
        return {
            version: 2,
            updates: [
                {
                    'package-ecosystem': 'npm',
                    directory: '/',
                    schedule: {
                        interval: 'weekly'
                    }
                }
            ]
        }
    })
    await createDependabotConfig({})
    expect(mockWriteFile).toHaveBeenCalledWith('.github/dependabot.yml', 'final yaml')
})