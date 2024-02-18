import fs from 'fs';
import { zip } from 'zip-a-folder';
import { green, red, yellow } from './logger.js';


export async function createDirectoryIfNotExists(directoryPath: string) {
    try {
        const directoryExists = await fs.promises.stat(directoryPath).then(stat => stat.isDirectory()).catch(() => false);

        if (directoryExists) {
            console.log(yellow(`Das Verzeichnis ${directoryPath} existiert bereits.`));
            return false;
        } else {
            await fs.promises.mkdir(directoryPath, { recursive: true });
            console.log(green(`Das Verzeichnis ${directoryPath} wurde erfolgreich erstellt.`));
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
            console.log(yellow(`Die Datei ${fileName} wurde nicht erstellt da sie bereits vorhanden ist`));
            return false;
        } else {
            fs.writeFile(fileName, content, (e) => {
                if (e) {
                    console.log(red(`Die Datei ${fileName} konnte nicht erstellt werden: ${e.message}`));
                    return false;
                }
            });
            console.log(green(`Die Datei ${fileName} wurde erfolgreich erstellt.`))
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
            console.log(yellow(`Das Verzeichnis ${directoryPath} existiert nicht.`));
            return false;
        } else {
            await fs.promises.rm(directoryPath, { recursive: true });
            console.log(green(`Das Verzeichnis ${directoryPath} wurde erfolgreich gelöscht.`));
            return true;
        }
    } catch (error) {
        console.error(red(`An error occured: ${error.message}`));
        process.exit(1);
    }
}


export async function createZipFromDirectory(dir: string, outDir: string) {

    // Überprüfen, ob das Verzeichnis existiert
    if (!fs.existsSync(dir)) {
        console.log(red(`Das Verzeichnis '${dir}' existiert nicht.`))
        return false;
    }

    const dirCreatonResult = createDirectoryIfNotExists(outDir)
        .catch(error => console.log(red(`Ein Fehler ist beim Überprüfen/Erstellen des Verzeichnisses aufgetreten: ${error.message}`)))
    if (!dirCreatonResult) {
        console.log(red(`Das Verzeichnis ${outDir} existiert bereits.`));
        return false;
    }



    if (dirCreatonResult) {
        const dirExist = await fs.promises.stat(outDir).then(stat => stat.isDirectory()).catch(e => { throw e })

        if (dirExist) {
            const zipResult = await zip(dir, outDir + `backup_${new Date().toISOString()}.zip`);

            if (zipResult instanceof Error) {
                console.log(red('Could not create Zip: ' + zipResult.message))
                return false;
            } else {
                console.log(green('Created Zip!'))
                return true;
            }
        }
    }
}