import * as mongoose from 'mongoose'
const { connection } = mongoose;
import MongooseHelper from './MongooseHelper.js';
/**
 * 
 * Creates a backup from the specified database in to a directoreie
 * 
 */

export interface IDatabaseBackupOptions {
    outDir?: string,
    //Connection String Example: mongodb+srv://myDatabaseUser:D1fficultP%40ssw0rd@cluster0.example.mongodb.net/?retryWrites=true&w=majority
    databaseUser?: string,
    password?: string,
    clusterAndExtension?: string,
    database?: string,
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

    public async main() {






    }

}

(async () => {
    await MongooseHelper.connectToDatabase().then((c) => {

        setTimeout(() => {
            console.log(connection)

            connection.destroy();
        }, 2000)


    });
})();