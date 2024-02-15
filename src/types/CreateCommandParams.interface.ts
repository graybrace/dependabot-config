import { PathIgnores } from "./PathIgnores.interface";
import { Schedule } from "./Schedule.interface";

export interface CreateCommandParams {
    packageEcosystem?: string[]
    schedule?: Schedule
    ignore?: PathIgnores
}