import fs from "fs";
import util from "node:util";
export async function cleanupFiles() {
  const unlinkAsync = util.promisify(fs.unlink);

  const filePath = "devices.json";
  unlinkAsync(filePath)
    .catch((err) => console.log(`Error deleting file: ${err}`))
    .then(() => console.log(`File ${filePath} has been deleted.`));
}
