import { dirname } from "path";
import { Update } from "../types/DependabotUpdate.interface";
import { PackageEcosystem } from "../types/PackageEcosystem.type";
import { PathIgnores } from "../types/PathIgnores.interface";
import { Schedule } from "../types/Schedule.interface";
import { has } from "../util/array";
import { visitFiles } from "../util/file-visitor";
import { getPackageEcosystem } from "./package-ecosystem";

const DEPENDABOT_CONFIG_VERSION = 2

interface CreateParams {
    packageEcosystem: PackageEcosystem[]
    schedule: Schedule
    ignore: PathIgnores
}

export const create = async(params: CreateParams) => {
    const updates: Update[] = []

    // No package file for GitHub Actions; if it's included, add it
    if (has(params.packageEcosystem, 'github-actions')) {
        updates.push(makePackageUpdate('github-actions', '/', params.schedule))
    }

    // Search the repo for relevant package files
    await visitFiles('.', async(path) => {
        const packageEcosystem = getPackageEcosystem(path)
        if (packageEcosystem && has(params.packageEcosystem, packageEcosystem)) {
            console.debug(`Found ${packageEcosystem} package file: ${path}`)
            updates.push(makePackageUpdate(packageEcosystem, getPackageDirectory(path), params.schedule))
        }
    }, params.ignore)

    return { version: DEPENDABOT_CONFIG_VERSION, updates }
}

const makePackageUpdate = (packageEcosystem: string, directory: string, schedule: Update['schedule']) => {
    return {
        'package-ecosystem': packageEcosystem,
        directory,
        schedule
    }
}

const getPackageDirectory = (path: string) => {
    const dir = dirname(path)
    if (dir.length === 1 && dir[0] === '.') {
        return '/'
    } else {
        return dir
    }
}