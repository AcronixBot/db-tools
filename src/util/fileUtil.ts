import fs from 'fs';
import * as archiver from 'archiver';
import { green, red, yellow } from './logger.js';

const { create } = archiver;

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


export async function createZipFromDirectory(dir: string, outFile: string) {
    console.log('zip creation started')

    // Überprüfen, ob das Verzeichnis existiert
    if (!fs.existsSync(dir)) {
        console.log(red(`Das Verzeichnis '${dir}' existiert nicht.`))
        return;
    }

    const output = fs.createWriteStream(outFile);
    const archive = create('zip', {
        zlib: { level: 9 } // Kompressionsstufe: maximal
    });

    // Fehlerbehandlung
    output.on('error', (error?: Error) => {
        if (error) {
            console.log(red('Fehler beim Erstellen der Zip-Datei:'), error);
        } else {
            console.log(red('Archivierung abgeschlossen.'));
        }
    });
    archive.on('error', (error?: Error) => {
        if (error) {
            console.error(red('Fehler beim Erstellen der Zip-Datei:'), error);
        } else {
            console.log(red('Archivierung abgeschlossen.'));
        }
    });

    // Dateien hinzufügen
    archive.directory(dir, false);

    // Abschluss des Archivierungsprozesses
    output.on('close', () => {
        console.log(`Die Zip-Datei wurde erfolgreich erstellt: ${outFile}`);
        console.log(green('Archivierung abgeschlossen.'));
    });

    // Archivierung starten
    archive.pipe(output);
    archive.finalize();
}