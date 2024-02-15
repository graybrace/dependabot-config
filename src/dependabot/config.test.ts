const mockVisitFiles = jest.fn(async(
    _: string,
    visitor: (path: string) => unknown,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    ignored: PathIgnores
) => {
    await Promise.resolve(visitor('package.json'))
    await Promise.resolve(visitor('pom.xml'))
    await Promise.resolve(visitor('requirements.txt'))
    await Promise.resolve(visitor('something.else'))
    await Promise.resolve(visitor('abc/package.json'))
    await Promise.resolve(visitor('abc/pom.xml'))
    await Promise.resolve(visitor('abc/requirements.txt'))
    await Promise.resolve(visitor('abc/something.else'))
})

jest.mock('../util/file-visitor', () => {
    const originalModule = jest.requireActual('../util/file-visitor')

    return {
        __esModule: true,
        ...originalModule,
        visitFiles: mockVisitFiles
    }
})

import { PathIgnores } from "../types/PathIgnores.interface";
import { create } from "./config";

afterEach(() => {
    jest.clearAllMocks()
})

it('github-actions included adds a section for github-actions', async() => {
    const config = await create({
        packageEcosystem: [ 'github-actions' ],
        schedule: {
            interval: 'monthly'
        },
        ignore: {}
    })
    expect(mockVisitFiles).toHaveBeenCalledTimes(1)
    expect(mockVisitFiles.mock.calls[0][0]).toBe('.')
    expect(mockVisitFiles.mock.calls[0][2]).toStrictEqual({})
    expect(config).toStrictEqual({
        version: 2,
        updates: [
            {
                'package-ecosystem': 'github-actions',
                directory: '/',
                schedule: { interval: 'monthly' }
            }
        ]
    })
})

it('npm only includes only npm updates', async() => {
    const config = await create({
        packageEcosystem: [ 'npm' ],
        schedule: {
            interval: 'weekly'
        },
        ignore: {
            dir: [ 'abc' ],
            path: [ '123' ]
        }
    })
    expect(mockVisitFiles).toHaveBeenCalledTimes(1)
    expect(mockVisitFiles.mock.calls[0][0]).toBe('.')
    expect(mockVisitFiles.mock.calls[0][2]).toStrictEqual({
        dir: [ 'abc' ],
        path: [ '123' ]
    })
    expect(config).toStrictEqual({
        version: 2,
        updates: [
            {
                'package-ecosystem': 'npm',
                directory: '/',
                schedule: { interval: 'weekly' }
            },
            {
                'package-ecosystem': 'npm',
                directory: 'abc',
                schedule: { interval: 'weekly' }
            }
        ]
    })
})

it('all ecosystems included', async() => {
    const config = await create({
        packageEcosystem: [ 'maven', 'npm', 'pip' ],
        schedule: {
            interval: 'weekly'
        },
        ignore: {}
    })
    expect(mockVisitFiles).toHaveBeenCalledTimes(1)
    expect(mockVisitFiles.mock.calls[0][0]).toBe('.')
    expect(mockVisitFiles.mock.calls[0][2]).toStrictEqual({})
    expect(config).toStrictEqual({
        version: 2,
        updates: [
            {
                'package-ecosystem': 'npm',
                directory: '/',
                schedule: { interval: 'weekly' }
            },
            {
                'package-ecosystem': 'maven',
                directory: '/',
                schedule: { interval: 'weekly' }
            },
            {
                'package-ecosystem': 'pip',
                directory: '/',
                schedule: { interval: 'weekly' }
            },
            {
                'package-ecosystem': 'npm',
                directory: 'abc',
                schedule: { interval: 'weekly' }
            },
            {
                'package-ecosystem': 'maven',
                directory: 'abc',
                schedule: { interval: 'weekly' }
            },
            {
                'package-ecosystem': 'pip',
                directory: 'abc',
                schedule: { interval: 'weekly' }
            }
        ]
    })
})