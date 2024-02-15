#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createDependabotConfig } from "./command/create";
import { CreateCommandParams } from "./types/CreateCommandParams.interface";

yargs(hideBin(process.argv))
    .command<CreateCommandParams>([ 'create' ], 'create dependabot config', yargs => {
        yargs
            .array('packageEcosystem')
            .array('ignore.dir')
            .array('ignore.path')
            .string('schedule.interval')
            .alias('p', 'packageEcosystem')
            .alias('int', 'schedule.interval')
    }, async(argv) => {
        console.debug('create dependabot config')
        console.debug('args:', JSON.stringify(argv, undefined, 2))
        try {
            await createDependabotConfig(argv)
        } catch (err) {
            if (err instanceof Error) {
                console.info(err.message)
            } else {
                console.info('Unexpected error occurred')
            }
        }
    })
    .help()
    .parse()