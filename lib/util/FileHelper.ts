import fs from "fs";
import { zip } from "zip-a-folder";
import * as path from "path";
import { DbHelperError } from "@lib/util/ErrorHelper.js";

export default class File {
  public static async getFileSizeFromFilePath(filePath: string) {
    try {
      const stats = await fs.promises.stat(filePath);

      if (!stats.isFile()) {
        throw new DbHelperError(
          `The path does not point to a file: ${filePath}`
        );
      }

      return stats.size;
    } catch (err) {
      throw new DbHelperError(`Error reading file: ${err.message}`);
    }
  }

  public static async createDirectoryIfNotExists(directoryPath: string) {
    try {
      const directoryExists = await fs.promises
        .stat(directoryPath)
        .then((stat) => stat.isDirectory())
        .catch(() => false);

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
      const fileExists = await fs.promises
        .stat(fileName)
        .then((stat) => stat.isFile())
        .catch(() => false);

      if (!fileExists) {
        fs.writeFile(fileName, content, (e) => {
          if (e) {
            throw new DbHelperError(
              `The file ${fileName} could not be created: ${e.message}`,
              e
            );
          } else {
            return true;
          }
        });
      }
    } catch (error) {
      throw new DbHelperError(`An error occured: ${error.message}`, error);
    }

    return false;
  }

  public static async deleteDirectoryIfExists(directoryPath: string) {
    try {
      const directoryExists = await fs.promises
        .stat(directoryPath)
        .then((stat) => stat.isDirectory())
        .catch(() => false);
      if (directoryExists) {
        await fs.promises.rm(directoryPath, { recursive: true });
        return true;
      }
    } catch (error) {
      throw new DbHelperError(`An error occured: ${error.message}`);
    }

    return false;
  }

  public static async createZipFromDirectory(
    dir: string,
    outDir: string
  ): Promise<{
    created: boolean;
    outPath: string | null;
    fileName: string | null;
  }> {
    if (!fs.existsSync(dir)) {
      return {
        created: false,
        outPath: null,
        fileName: null,
      };
    }

    const createZipFromDirectoryResult = await Promise.allSettled([
      File.createDirectoryIfNotExists(outDir),
    ])
      .then(async (result) => {
        const allFulfilled = result.every(
          (result) => result.status === "fulfilled"
        );
        if (allFulfilled) {
          const zipCreatendResult = await File._createZip(dir, outDir);
          if (zipCreatendResult.result) {
            const deletedTempDirs = await Promise.allSettled([
              File.deleteDirectoryIfExists(dir),
            ])
              .then((result) => {
                //@ts-ignore
                if (result.some((v) => v.value === false)) {
                  return false;
                }
                const dirDeleted = result.every(
                  (r) => r.status === "fulfilled"
                );
                return dirDeleted;
              })
              .catch((e) => {
                throw new DbHelperError(
                  `An error occurred while deleting the temp directory: ${e.message}`,
                  e
                );
              });

            return {
              created: deletedTempDirs,
              outPath: zipCreatendResult.outpath,
              fileName: zipCreatendResult.fileName,
            };
          }
        } else {
          throw new DbHelperError(
            "Some collections were not handled successfully.",
            result.filter((r) => r.status === "rejected")
          );
        }
      })
      .catch((error) => {
        throw new DbHelperError(
          `An error occurred while checking/creating the directory: ${error.message}`
        );
      });

    return createZipFromDirectoryResult;
  }

  private static async _createZip(dir: string, outDir: string) {
    const fileName = `backup_${new Date().getTime()}.zip`;
    const zipPath = path.normalize(path.resolve(outDir, fileName));
    var zipCreatedResult = false;
    zipCreatedResult = await Promise.allSettled([zip(dir, zipPath)])
      .then((result) => {
        const allFulfilled = result.every(
          (result) => result.status === "fulfilled"
        );
        if (allFulfilled) {
          return true;
        } else {
          throw new DbHelperError(
            "Some collections were not handled successfully.",
            result.filter((r) => r.status === "rejected")
          );
        }
      })
      .catch((e) => {
        throw new DbHelperError(e);
      });

    return { outpath: zipPath, result: zipCreatedResult, fileName: fileName };
  }
}
