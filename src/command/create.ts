import fs from "fs";
import { stringify } from "yaml";
import { create } from "../dependabot/config";
import { CreateCommandParams } from "../types/CreateCommandParams.interface";
import { supportedPackageEcosystems } from "../types/PackageEcosystem.type";
import { ensureDirectoryExists, isDirectory, writeFile } from "../util/file";

const GIT_DIR_NAME = '.git'
const GITHUB_DIR_NAME = '.github'
const DEPENDABOT_CONFIG_FILE_PATH = `${GITHUB_DIR_NAME}/dependabot.yml`

export const createDependabotConfig = async(params: CreateCommandParams) => {
    if (!await isDirectory(GIT_DIR_NAME)) {
        throw new Error('Current directory is not the root of a Git repository')
    }

    console.debug('Make sure ./.github exists...')
    await ensureDirectoryExists(GITHUB_DIR_NAME)

    if (fs.existsSync(DEPENDABOT_CONFIG_FILE_PATH)) {
        throw new Error(`Dependabot configuration file '${DEPENDABOT_CONFIG_FILE_PATH}' already exists`)
    } else {
        const fullParams = makeFullCreateParams(params)
        const config = await create(fullParams)
        if (config.updates.length > 0) {
            const yaml = stringify(config, {
                aliasDuplicateObjects: false // Explicitly repeat global/default configs that are reused for multiple packages
            })
            console.debug(`Writing ${DEPENDABOT_CONFIG_FILE_PATH}...`)
            await writeFile(DEPENDABOT_CONFIG_FILE_PATH, yaml)
        } else {
            console.warn('No package files found')
        }
    }
}

const makeFullCreateParams = (params: CreateCommandParams) => {
    return {
        packageEcosystem: params.packageEcosystem || supportedPackageEcosystems,
        schedule: {
            interval: params.schedule?.interval || 'monthly'
        },
        ignore: {
            ...params.ignore,
            dir: [ ...(params.ignore?.dir || []), 'node_modules', '**/node_modules' ]
        }
    }
}