import fs from "fs";
import util from "node:util";

export async function cleanupFiles(filePaths:Array<string>) {
  const unlinkAsync = util.promisify(fs.unlink);
  filePaths.forEach((filePath)=>{
  unlinkAsync(filePath)
    .catch((err) => console.log(`Error deleting file: ${err}`))
    .then(() => console.log(`File ${filePath} has been deleted.`));})
}


