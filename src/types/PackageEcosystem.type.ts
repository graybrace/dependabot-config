import { ArrayElement } from "./ArrayElement.type";

export const supportedPackageEcosystems = [ 'github-actions', 'maven', 'npm', 'pip' ]
export type PackageEcosystem = ArrayElement<typeof supportedPackageEcosystems>