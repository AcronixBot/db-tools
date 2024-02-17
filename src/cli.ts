import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import picocolors from 'picocolors'
import prompts from 'prompts'
import DatabaseBackup, { BackupOptions } from '@db/db/DatabaseBackup.js';

const { blue, green, red, yellow } = picocolors;
const program = new commander.Command();
const configSafePath = path.resolve(process.cwd(), 'config', 'db.config.json');

console.log(blue("[BACKUP] [INFO] Backup Started..."))





async function connectionStringQuestion() {
    const connectionStringQuestion = await prompts({
        name: 'result',
        type: 'text',
        message: `What is the connection string to your database?`,
        validate: (input) => {

            const mongoDbConnectionRegex = /mongodb(?:\+srv)?:\/\/(?:(?<login>[^\:\/\?\#\[\]\@]+)(?::(?<password>[^\:\/\?\#\[\]\@]+))?@)?(?<host>[\w\.\-]+(?::\d+)?(?:,[\w\.\-]+(?::\du+)?)*)(?:\/(?<dbname>[\w\.\-]+))?(?:\?(?<query>[\w\.\-]+=[\w\.\-]+(?:&[\w\.\-]+=[\w.\-]+)*))?(?<rest>.*)/gm

            if (mongoDbConnectionRegex.test(input)) {
                return true;
            }

            return `Your connection string is not valid`
        }
    })

    if (typeof connectionStringQuestion.result === 'string') {
        return connectionStringQuestion.result;
    }
}

async function outDirQuestion() {
    const outDirQuestion = await prompts({
        name: 'result',
        type: 'text',
        message: 'Where would you like to safe the backup?',
        active: './backups/',
        validate: (input) => {
            const pathRegex = /[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\?)*/gm;
            if (pathRegex.test(input)) {
                return true;
            }

            return `You Path does not match a windows path`;
        }
    })

    if (typeof outDirQuestion.result === 'string') {
        return outDirQuestion.result.replace("\\\\", "\\");
    }
}

async function zipQuestion() {
    const zip = await prompts({
        name: 'result',
        type: 'select',
        message: 'Would you like to safe the backup as a zip?',
        choices: [
            { title: 'Zip', value: true },
            { title: 'Folder', value: false },
        ]
    })

    if (typeof zip.result === 'boolean') {
        return zip.result;
    }
}

async function verifyQuestion(configParam: BackupOptions) {
    const verifyConfigQuestion = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Is this you config? ${JSON.stringify(configParam, undefined, 2)}`,
        initial: true
    })

    if (typeof verifyConfigQuestion.value === 'boolean') {
        if (verifyConfigQuestion.value === false) {
            console.log(red('[BACKUP] [ERROR] Please start again and enter your config!'))
            process.exit(0);
        } else {
            console.log(green('[BACKUP] [SUCCESS] Ok. I start with the backup now!'))
        }
    }
}

async function loadJsonFromFile() {
    let returnValue: BackupOptions | NodeJS.ErrnoException;
    try {
        const result = fs.readFileSync(configSafePath, 'utf8');
        const jsonData = JSON.parse(result) as BackupOptions;
        returnValue = jsonData;
    } catch (e) {
        returnValue = e;
    }

    return returnValue;
}

function indicateMissingConfigProps(config: BackupOptions) {
    let missingProps: { [key: string]: boolean | string } = {}

    if (typeof config.zip !== 'boolean') {
        missingProps.zip = true;
    }

    if (typeof config.connectionString !== 'string') {
        missingProps.connectionString = true
    }

    if (typeof config.outDir !== 'string') {
        missingProps.outDir = true;
    }

    return missingProps;
}


async function createBackup(config: BackupOptions) {
    DatabaseBackup.main(config);
}

/**
 ** 
 ** Actuel CLI Questions
 **
 */

let config: BackupOptions = {/** */ }

program
    .option('-m, --manuel', 'Asks the executor to input all nesessery config options');
program.parse(process.argv);
const options = program.opts();
if (options.manuel) {
    console.log(blue("[BACKUP] [INFO] Manuel configuration"));

    const connectionStringQuestionResult = await connectionStringQuestion();
    if (typeof connectionStringQuestionResult !== 'string') {
        console.log(red("[BACKUP] [ERROR] The connection string was not valid"))
        process.exit(0);
    }
    config.connectionString = connectionStringQuestionResult;

    const outDirQuestionResult = await outDirQuestion();
    if (typeof outDirQuestionResult !== 'string') {
        console.log(red("[BACKUP] [ERROR] The out dir was not valid"))
        process.exit(0);
    }
    config.outDir = outDirQuestionResult;

    const zipQuestionResult = await zipQuestion();
    config.zip = zipQuestionResult;

    await verifyQuestion(config);

    console.log(green("[BACKUP] [SUCCESS] Starting with the Backup now!"))

    //TODO run the backup function with the config
} else {
    console.log(blue("[BACKUP] [INFO] Loading JSON config..."))

    const loadedConfig = await loadJsonFromFile();

    if (loadedConfig) {
        if ('connectionString' in loadedConfig || 'outDir' in loadedConfig || 'zip' in loadedConfig) {
            const notLoadedValues = Object.entries(indicateMissingConfigProps(loadedConfig));

            if (notLoadedValues.some(v => v[1] === true)) {
                console.log(yellow('[BACKUP] [WARN] Not all required values could be loaded!'))

                const transformedValues = notLoadedValues.map(v => v[0]);

                if (transformedValues.includes('connectionString')) {
                    const connectionStringQuestionResult = await connectionStringQuestion();
                    if (typeof connectionStringQuestionResult !== 'string') {
                        console.log(red("[BACKUP] [ERROR] The connection string was not valid"))
                        process.exit(0);
                    }
                    config.connectionString = connectionStringQuestionResult;
                }

                if (transformedValues.includes('zip')) {
                    const zipQuestionResult = await zipQuestion();
                    config.zip = zipQuestionResult;
                }

                if (transformedValues.includes('outDir')) {
                    const outDirQuestionResult = await outDirQuestion();
                    if (typeof outDirQuestionResult !== 'string') {
                        console.log(red("[BACKUP] [ERROR] The out dir was not valid"))
                        process.exit(0);
                    }
                    config.outDir = outDirQuestionResult;
                }

            } else {
                console.log(green("[BACKUP] [SUCCESS] Successfully loaded the config!"))

                config = loadedConfig;
            }

            console.log(green("[BACKUP] [SUCCESS] tarting with the Backup now!"))

            //TODO run the backup function with the config
            createBackup(config);
        }

    } else {
        console.log(red('[BACKUP] [ERROR] Could not load the config. Exit!'))
        process.exit(0);
    }
}
