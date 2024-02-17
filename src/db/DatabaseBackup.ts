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

export interface BackupOptions {
    connectionString?: string,
    outDir?: string,
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
        const mongooseConnection = await MongooseHelper.connectToDatabase(config.connectionString);
        //TODO figure out why only test retures even i dont have a database or collection named after it
        console.log(mongooseConnection.connections.map(c => c.name));

        setTimeout(() => mongooseConnection.disconnect(), 5000)
    }

    public async main() {
        // console.log(connection.db.listCollections());
    }


    private createTempDir() {

    }

    private createZip() {

    }


}
