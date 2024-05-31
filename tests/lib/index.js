import prettyMilliseconds from "pretty-ms";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

import { BackupHelper } from "../../package/BackupHelper.js";

const prefix = "TEST [BACKUP TEST] : ";
console.log(prefix + "Starting Test");

const helper = new BackupHelper({
  connectionString: process.env.DB_CON,
  outDir: "\\tests\\outdir\\",
});

const creationResult = helper.create();
creationResult.then((result) => {
  console.log(prefix + "Creation took" + prettyMilliseconds(result.timestamp));

  console.log(prefix + "Outpath: " + result.outDirPath);
  console.log(prefix + "Filename: " + result.fileName);

  const doesPathExists = fs.existsSync(result.outDirPath);

  if (doesPathExists) {
    console.log(prefix + "File exists under " + result.outDirPath);
  } else {
    console.log(prefix + "File does not exists under " + result.outDirPath);
  }
});
