import File from "@lib/util/FileHelper.js";
import { Collection, connect, disconnect, set } from "mongoose";
import { DbHelperError } from "@lib/util/ErrorHelper.js";
import * as path from "path";

interface BackupOptions {
  outDir: `\\${string}\\`;
  connectionString: string;
}

export class BackupHelper {
  private options: BackupOptions;

  constructor(options: BackupOptions) {
    this.options = options;
  }
  /**
   *
   * @param {String} path
   * @returns
   */
  private normalizePathForLinux(path: string) {
    if (process.platform === "linux") {
      return path.replaceAll("\\", "/");
    } else {
      return path;
    }
  }

  public async create() {
    const database = this.extractDatabaseFromURI(this.options.connectionString);
    if (!database) {
      throw new Error(
        "Could not find database with the provieded connection string while trying to create a database backup!"
      );
    }

    const mongooseConnection = await this.connectToDatabase(
      this.options.connectionString
    );

    const connection = mongooseConnection.connections.find(
      (v) => v.name === database
    );

    if (connection === undefined) {
      throw new Error(
        "Could not find connection while trying to create a database backup"
      );
    }

    const collections = await connection.db.collections();

    if (collections.length > 0) {
      //FIX Everything Syncron from this point

      //Declare dir paths
      const tempDir = process.cwd() + this.normalizePathForLinux(`\\temp\\`);
      const outputDir =
        process.cwd() + this.normalizePathForLinux(this.options.outDir);

      //Create Temp Dir
      try {
        File.createDirectoryIfNotExists(tempDir);
      } catch (e) {
        throw new DbHelperError(e);
      }

      // iterate over all collections and write the data to the json files

      const endResult = await Promise.allSettled(
        //@ts-expect-error
        collections.map((collection) => this.handleCollection(collection))
      ).then(async (results) => {
        // Check if all promises were fulfilled
        const allFulfilled = results.every(
          (result) => result.status === "fulfilled"
        );
        if (allFulfilled) {
          const endResult = await File.createZipFromDirectory(
            tempDir,
            outputDir,
            true
          );
          return endResult;
        } else {
          throw new DbHelperError(
            "Some collections were not handled successfully."
          );
        }
      });
      disconnect();
      return endResult;
    }
  }

  private extractDatabaseFromURI(uri: string) {
    //mongodb+srv://myDatabaseUser:D1fficultP%40ssw0rd@cluster0.example.mongodb.net/database?retryWrites=true&w=majority
    //* split(':')[2] -> D1fficultP%40ssw0rd@cluster0.example.mongodb.net/database?retryWrites=true&w=majority
    //* split('/')[1] -> database?retryWrites=true&w=majority
    //* split('?')[0] -> database
    return uri.split(":")[2].split("/")[1].split("?")[0];
  }

  private async connectToDatabase(uri: string) {
    set("strictQuery", true);
    return await connect(uri);
  }

  private async handleCollection(collection: Collection) {
    const foundedEntry = collection.find();
    const fileName =
      process.cwd() +
      this.normalizePathForLinux(`\\temp\\${collection.collectionName}.json`);
    if (!foundedEntry) {
      File.createFileIfNotExists(fileName, []);
    } else {
      File.createFileIfNotExists(
        fileName,
        JSON.stringify(await foundedEntry.toArray(), null, 2)
      );
    }
  }
}
