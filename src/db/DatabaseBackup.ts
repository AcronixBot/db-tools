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
    #config: BackupOptions;

    constructor(config: BackupOptions) {
        this.#config = config;
    }

    async create() {

        const database = this.extractDatabaseFromURI(this.#config.connectionString);
        if (!database) {
            return console.log(red(`Could not find database with the provieded connection string!`))
        }

        const mongooseConnection = await MongooseHelper.connectToDatabase(this.#config.connectionString);

        const connection = mongooseConnection.connections.find(v => v.name === database);
        const collections = await connection.db.collections();

        if (collections.length > 0) {

            //FIX Everything Syncron from this point

            //Declare dir paths
            const tempDir = process.cwd() + `\\temp\\`;
            const outputDir = process.cwd() + `\\backup\\`

            //Create Temp Dir
            const tempDirResult = createDirectoryIfNotExists(tempDir)
                .catch(error => console.log(red(`Ein Fehler ist beim Überprüfen/Erstellen des Verzeichnisses aufgetreten: ${error.message}`)))
            if (tempDirResult.then(r => r === false)) {
                console.log(red(`Das Verzeichnis ${tempDir} existiert bereits.`));
            }

            // iterate over all collections and write the data to the json files

            Promise //@ts-expect-error
                .allSettled(collections.map(collection => this.handleCollection(collection)))
                .then(results => {
                    // Check if all promises were fulfilled
                    const allFulfilled = results.every(result => result.status === 'fulfilled');
                    if (allFulfilled) {
                        // create zip if zip
                        if (this.#config.zip) {
                            createZipFromDirectory(tempDir, outputDir, true);
                        } else {
                            process.exit(0);
                        }
                    } else {
                        // Handle if any of the promises were rejected
                        console.error('Some collections were not handled successfully.');
                    }
                });
        }
    }

    private extractDatabaseFromURI(uri: string) {
        //mongodb+srv://myDatabaseUser:D1fficultP%40ssw0rd@cluster0.example.mongodb.net/database?retryWrites=true&w=majority
        //* split(':')[2] -> D1fficultP%40ssw0rd@cluster0.example.mongodb.net/database?retryWrites=true&w=majority
        //* split('/')[1] -> database?retryWrites=true&w=majority
        //* split('?')[0] -> database
        return uri.split(':')[2].split('/')[1].split('?')[0];
    }

    private async handleCollection(collection: Collection) {
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
