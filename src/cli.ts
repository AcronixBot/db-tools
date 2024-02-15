import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import picocolors from 'picocolors'
import prompts from 'prompts'

const { blue, green, red, yellow } = picocolors;
const program = new commander.Command();
const configSafePath = path.resolve(process.cwd(), 'config', 'db.config.json');

console.log(blue("Backup Started..."))


interface BackupOptions {
    connectionString?: string,
    outDir?: string,
    zip?: boolean
}

let config: BackupOptions = {

}


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
            console.log(red('Please start again and enter your config!'))
            process.exit(0);
        } else {
            console.log(green('Ok. I start with the backup now!'))
        }
    }
}

async function loadJsonFromFile() {
    let returnValue: BackupOptions | NodeJS.ErrnoException;
    fs.readFile(configSafePath, 'utf8', (err, data) => {
        if (err) {
            returnValue = err;
            return returnValue;
        }
        try {
            const jsonData = JSON.parse(data) as BackupOptions;
            returnValue = jsonData;
        } catch (parseErr) {
            returnValue = parseErr;
        }
    });

    return returnValue;
}

/**
 ** 
 ** Actuel CLI Questions
 **
 */

program
    .option('-m, --manuel', 'Asks the executor to input all nesessery config options');
program.parse(process.argv);
const options = program.opts();
if (options.manuel) {
    console.log(blue("Manuel configuration"));

    const connectionStringQuestionResult = await connectionStringQuestion();
    if (typeof connectionStringQuestionResult !== 'string') {
        console.log(red("The connection string was not valid"))
        process.exit(0);
    }
    config.connectionString = connectionStringQuestionResult;

    const outDirQuestionResult = await outDirQuestion();
    if (typeof outDirQuestionResult !== 'string') {
        console.log(red("The out dir was not valid"))
        process.exit(0);
    }
    config.outDir = outDirQuestionResult;

    const zipQuestionResult = await zipQuestion();
    config.zip = zipQuestionResult;

    const verifyQuestionResult = await verifyQuestion(config);

} else {
    console.log(blue("Loading JSON config..."))

    const loadedConfig = await loadJsonFromFile();
    //TODO
}
