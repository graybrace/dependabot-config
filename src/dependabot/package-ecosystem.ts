import { minimatch } from "minimatch";
import { PackageEcosystem } from "../types/PackageEcosystem.type";

interface PackageEcosystemHandler {
    packageFilePatterns: string[]
}

type FindablePackageEcosystem = Exclude<PackageEcosystem, 'github-actions'>

const PACKAGE_ECOSYSTEM_HANDLERS: {[key: FindablePackageEcosystem]: PackageEcosystemHandler} = {
    maven: {
        packageFilePatterns: [ 'pom.xml' ]
    },
    npm: {
        packageFilePatterns: [ 'package.json' ]
    },
    pip: {
        packageFilePatterns: [ 'requirements.txt' ]
    }
}

export const getPackageEcosystem = (filePath: string): FindablePackageEcosystem | undefined => {
    return Object.keys(PACKAGE_ECOSYSTEM_HANDLERS).find(key => isEcosystemPackageFile(key, filePath))
}

const isEcosystemPackageFile = (ecosystem: FindablePackageEcosystem, path: string) => {
    return !!PACKAGE_ECOSYSTEM_HANDLERS[ecosystem].packageFilePatterns.find(p => minimatch(path, `**/${p}`))
}