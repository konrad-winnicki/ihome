import fs from "fs";
import util from "node:util";

export async function cleanupFiles(filePaths: Array<string>) {
  const unlinkAsync = util.promisify(fs.unlink);
  const results = filePaths.map((filePath) =>
    unlinkAsync(filePath)
      .catch((err) => console.log(`Error deleting file: ${err}`))
      .then(() => console.log(`[Cleanup] File ${filePath} has been deleted.`))
  );
  return Promise.all(results);
}
