import { readdir } from "fs/promises";
import { minimatch } from "minimatch";
import { join } from "path";
import { PathIgnores } from "../types/PathIgnores.interface";
import { isDirectory } from "./file";

type FileVisitor = (path: string) => unknown

export const visitFiles = async(base: string, visitor: FileVisitor, ignore: PathIgnores = {}) => {
    console.debug('Traversing repo structure to find package files...')
    const dirs = [ base ]

    while (dirs.length > 0) {
        const nextDir = dirs.shift()
        if (nextDir && !hasPathMatch(nextDir, ignore.dir)) {
            console.debug(' -> Traversing directory:', nextDir)

            // Get direct subpaths of the current directory
            const newPaths = await readdir(nextDir)
            for (const newPath of newPaths) {
                const fullPath = join(nextDir, newPath)

                if (await isDirectory(fullPath)) {
                    // Add dir for later processing; will check for exclusion when it's top of queue
                    dirs.push(fullPath)
                } else if (!hasPathMatch(fullPath, ignore.path)) {
                    // Visit the file
                    await Promise.resolve(visitor(fullPath))
                }
            }
        }
    }
    console.debug('...finished traversing repo structure to find package files...')
}

const hasPathMatch = (path: string, patterns?: string[]) => !!(patterns || []).find(p => isPathMatch(path, p))

const isPathMatch = (path: string, pattern: string) => minimatch(path, pattern, {
    dot: true // Allow matching dirs like '.git'
})