import { PackageEcosystem } from "./PackageEcosystem.type";
import { Schedule } from "./Schedule.interface";

export interface Update {
    'package-ecosystem': PackageEcosystem
    directory: string
    schedule: Schedule
}