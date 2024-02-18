import fs from 'fs';
import { zip } from 'zip-a-folder';
import { green, red, yellow } from './logger.js';
import * as path from 'path';

export async function createDirectoryIfNotExists(directoryPath: string) {
    try {
        const directoryExists = await fs.promises.stat(directoryPath).then(stat => stat.isDirectory()).catch(() => false);

        if (directoryExists) {
            console.log(yellow(`The directory ${directoryPath} already exists.`));
            return false;
        } else {
            await fs.promises.mkdir(directoryPath, { recursive: true });
            console.log(green(`The directory ${directoryPath} was created.`));
            return true;
        }
    } catch (error) {
        console.error(red(`An error occured: ${error.message}`));
        process.exit(1);
    }
}

export async function createFileIfNotExists(fileName: string, content: any) {
    try {
        const fileExists = await fs.promises.stat(fileName).then(stat => stat.isFile()).catch(() => false);

        if (fileExists) {
            console.log(yellow(`The file ${fileName} already exists.`));
            return false;
        } else {
            fs.writeFile(fileName, content, (e) => {
                if (e) {
                    console.log(red(`The file ${fileName} could not be created: ${e.message}`));
                    return false;
                }
            });
            console.log(green(`The file ${fileName} was created.`))
        }
    } catch (error) {
        console.error(red(`An error occured: ${error.message}`));
        process.exit(1);
    }
}

export async function deleteDirectoryIfExists(directoryPath: string) {
    try {
        const directoryExists = await fs.promises.stat(directoryPath).then(stat => stat.isDirectory()).catch(() => false);

        if (!directoryExists) {
            console.log(yellow(`The directory ${directoryPath} already exists.`));
            return false;
        } else {
            await fs.promises.rm(directoryPath, { recursive: true });
            console.log(green(`The directory ${directoryPath} was deleted.`));
            return true;
        }
    } catch (error) {
        console.error(red(`An error occured: ${error.message}`));
        process.exit(1);
    }
}


export async function createZipFromDirectory(dir: string, outDir: string, zip: boolean) {
    // Überprüfen, ob das Verzeichnis existiert
    if (!fs.existsSync(dir)) {
        console.log(red(`The directory '${dir}' does not exist.`))
        return false;
    }

    Promise.allSettled([createDirectoryIfNotExists(outDir)]).then((result) => {
        // Check if all promises were fulfilled
        const allFulfilled = result.every(result => result.status === 'fulfilled');
        if (allFulfilled) {
            _createZip(dir, outDir);
            setTimeout(() => {
                Promise
                    .allSettled([deleteDirectoryIfExists(dir)])
                    .then((result) => {
                        const dirDeleted = result.every(r => r.status === 'fulfilled');
                        if (dirDeleted) {
                            console.log(green('Deleted the temp dir'))
                            console.log(green(`Backup Verzeichnis: ${zip ? outDir : dir}`))
                            process.exit(0);
                        } else {
                            return false;
                        }
                    })
                    .catch(e => {
                        console.log(red(`An error occurred while deleting the temp directory: ${e.message}`))
                        return false;
                    })
            }, 3500)
        } else {
            // Handle if any of the promises were rejected
            console.log(red('Some collections were not handled successfully.'));
            return false;
        }
    }).catch(error => {
        console.log(red(`An error occurred while checking/creating the directory: ${error.message}`))
        return false;
    })
}

function _createZip(dir: string, outDir: string) {
    const zipPath = path.normalize(path.resolve(outDir, `backup_${new Date().getTime()}.zip`));
    Promise
        .allSettled([zip(dir, zipPath)])
        .then((result) => {
            const allFulfilled = result.every(result => result.status === 'fulfilled');
            if (allFulfilled) {
                console.log(green('Created Zip!'))
            } else {
                console.log(result.filter(r => r.status === 'rejected'))
                console.error('Some collections were not handled successfully.');
            }
        })
        .catch(e => { throw e })
}
