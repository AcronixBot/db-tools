import * as fs from 'fs';
import * as path from 'path';

import MongooseHelper from './MongooseHelper.js';
import { createDirectoryIfNotExists, createFileIfNotExists, createZipFromDirectory, deleteDirectoryIfExists } from '@db/util/fileUtil.js';
import { green, red } from '@db/util/logger.js';
import { Collection, Document } from 'mongoose';

/**
 * 
 * Creates a backup from the specified database in to a directoreie
 * 
 */

export interface IDatabaseBackupOptions {
    outDir?: string,
    //Connection String Example: mongodb+srv://myDatabaseUser:D1fficultP%40ssw0rd@cluster0.example.mongodb.net/database?retryWrites=true&w=majority
    databaseUser?: string,
    password?: string,
    clusterAndExtension?: string,
    database?: string,
}

export interface BackupOptions {
    connectionString?: string,
    zip?: boolean
}

export default class DatabaseBackup {
    #options: IDatabaseBackupOptions;

    constructor(options: IDatabaseBackupOptions) {
        this.#options = options;
    }

    private buildConnectionString() {
        const defaultString = "mongodb+srv://{{user}}:{{password}}@{{clusterAndExtension}}.mongodb.net/{{database}}?retryWrites=true&w=majorit";
        defaultString.replace("{{user}}", this.#options.databaseUser);
        defaultString.replace("{{password}}", this.#options.password);
        defaultString.replace("{{clusterAndExtension}}", this.#options.clusterAndExtension);
        defaultString.replace("{{database}}", this.#options.database);

        return defaultString;
    }

    static async main(config: BackupOptions) {

        const database = this.extractDatabaseFromURI(config.connectionString);
        if (!database) {
            return console.log(red(`Could not find database with the provieded connection string!`))
        }

        const mongooseConnection = await MongooseHelper.connectToDatabase(config.connectionString);

        const connection = mongooseConnection.connections.find(v => v.name === database);
        const collections = await connection.db.collections();

        if (collections.length > 0) {
            //Create temp dir
            const tempDir = process.cwd() + `\\temp\\`;
            const outputDir = process.cwd() + `\\backup\\`
            const tempDirResult = await createDirectoryIfNotExists(tempDir)
                .catch(error => console.log(red(`Ein Fehler ist beim Überprüfen/Erstellen des Verzeichnisses aufgetreten: ${error.message}`)))
            if (!tempDirResult) {
                console.log(red(`Das Verzeichnis ${tempDir} existiert bereits.`));
            }

            //iterate over all collections and write the data to the json
            await Promise.all(collections.map(async (collection, index) => {
                //@ts-ignore
                await DatabaseBackup.handleCollection(collection);
            }))

            //until here everything works fine
            //create zip if zip
            // if (config.zip) {
            //     setTimeout(() => {
            //         createZipFromDirectory(tempDir, outputDir)
            //     }, 2500)
            // }

            // delete temp dir if zip has been created

            // if (tempDirResult && config.zip) {
            //     const deleteResult = await deleteDirectoryIfExists(tempDir)
            //         .catch(error => console.log(red(`Ein Fehler ist beim Überprüfen/Löschen des Verzeichnisses aufgetreten: ${error.message}`)))
            //     if (!deleteResult) {
            //         console.log(red(`Das Verzeichnis ${tempDir} wurde nicht gelöscht.`));
            //     }
            // }

            //output the destination of the zip or dir
            // console.log(green(`Backup Verzeichnis: ${config.zip ? outputDir : tempDir}`))
        }
    }


    private createZip() {

    }

    static extractDatabaseFromURI(uri: string) {
        //mongodb+srv://myDatabaseUser:D1fficultP%40ssw0rd@cluster0.example.mongodb.net/database?retryWrites=true&w=majority
        //* split(':')[2] -> D1fficultP%40ssw0rd@cluster0.example.mongodb.net/database?retryWrites=true&w=majority
        //* split('/')[1] -> database?retryWrites=true&w=majority
        //* split('?')[0] -> database
        return uri.split(':')[2].split('/')[1].split('?')[0];
    }

    static async handleCollection(collection: Collection) {
        const foundedEntry = collection.find();
        const fileName = process.cwd() + `\\temp\\${collection.collectionName}.json`;
        if (!foundedEntry) {
            createFileIfNotExists(fileName, []);
        }
        else {
            createFileIfNotExists(fileName, JSON.stringify(await foundedEntry.toArray(), null, 2));
        }
    }
}
