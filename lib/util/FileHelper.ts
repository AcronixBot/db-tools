import fs from 'fs';
import { zip } from 'zip-a-folder';
import * as path from 'path';
import { DbHelperError } from '@lib/util/ErrorHelper.js';


export default class File {
    public static async createDirectoryIfNotExists(directoryPath: string) {
        try {
            const directoryExists = await fs.promises.stat(directoryPath).then(stat => stat.isDirectory()).catch(() => false);

            if (!directoryExists) {
                await fs.promises.mkdir(directoryPath, { recursive: true });
                return true;
            }
        } catch (error) {
            throw new DbHelperError(`An error occured: ${error.message}`, error);
        }

        return false;
    }

    public static async createFileIfNotExists(fileName: string, content: any) {
        try {
            const fileExists = await fs.promises.stat(fileName).then(stat => stat.isFile()).catch(() => false);

            if (!fileExists) {
                fs.writeFile(fileName, content, (e) => {
                    if (e) {
                        throw new DbHelperError(`The file ${fileName} could not be created: ${e.message}`, e);
                    } else {
                        return true;
                    }
                });
            }
        } catch (error) {
            throw new DbHelperError(`An error occured: ${error.message}`, error)
        }

        return false;
    }

    public static async deleteDirectoryIfExists(directoryPath: string) {
        try {
            const directoryExists = await fs.promises.stat(directoryPath).then(stat => stat.isDirectory()).catch(() => false);
            if (directoryExists) {
                await fs.promises.rm(directoryPath, { recursive: true });
                return true;
            }
        } catch (error) {
            throw new DbHelperError(`An error occured: ${error.message}`);
        }

        return false;
    }

    public static async createZipFromDirectory(dir: string, outDir: string, zip: boolean) {
        if (!fs.existsSync(dir)) {
            return false;
        }

        const createZipFromDirectoryResut = await Promise.allSettled([File.createDirectoryIfNotExists(outDir)]).then(async (result) => {
            const allFulfilled = result.every(result => result.status === 'fulfilled');
            if (allFulfilled) {
                const zipCreatendResult = await File._createZip(dir, outDir);
                if (zipCreatendResult) {
                    return await Promise
                        .allSettled([File.deleteDirectoryIfExists(dir)])
                        .then((result) => {
                            //@ts-ignore
                            if (result.some(v => v.value === false)) {
                                return false;
                            }
                            const dirDeleted = result.every(r => r.status === 'fulfilled')
                            return dirDeleted;
                        })
                        .catch(e => {
                            throw new DbHelperError(`An error occurred while deleting the temp directory: ${e.message}`, e)
                        })
                }
            } else {
                throw new DbHelperError('Some collections were not handled successfully.', result.filter(r => r.status === "rejected"))
            }
        }).catch(error => {
            throw new DbHelperError(`An error occurred while checking/creating the directory: ${error.message}`)
        })
        return createZipFromDirectoryResut;
    }

    private static async _createZip(dir: string, outDir: string) {
        const zipPath = path.normalize(path.resolve(outDir, `backup_${new Date().getTime()}.zip`));
        var zipCreatedResult = false;
        zipCreatedResult = await Promise
            .allSettled([zip(dir, zipPath)])
            .then((result) => {
                const allFulfilled = result.every(result => result.status === 'fulfilled');
                if (allFulfilled) {
                    return true;
                } else {
                    throw new DbHelperError('Some collections were not handled successfully.', result.filter(r => r.status === 'rejected'))
                }
            })
            .catch(e => { throw new DbHelperError(e) })

        return zipCreatedResult;
    }
}