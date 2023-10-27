import fs from "fs/promises";
import * as sync from "node:fs";
import { Device } from "../../domain/Device";

export class FileRepositoryHelpers {
  async writeFile(path: string, data: object) {
    try {
      const content = JSON.stringify(data);
      await fs.writeFile(path, content);
    } catch (err) {
      console.log(err);
    }
  }

  async readFile(path: string) {
    if (!sync.existsSync(path)) {
      await this.writeFile(path, {});
    }
    return fs
      .readFile(path, "utf-8")
      .then((fileContent) => {
        const jsonObject = JSON.parse(fileContent);
        return Promise.resolve(jsonObject);
      })
      .catch((error) => Promise.reject(error));
  }

  findById(content: { [key: string]: object }, searchedKey: string) {
    const resultValue = content[searchedKey];
    if (resultValue) {
      return resultValue;
    }
    return null;
  }

  findIfNameExists(content: { [key: string]: Device }, searchedName: string) {
    const devices = Object.values(content);
    for (const device of devices){

      if (device.name === searchedName){
        return true;
      }
    }
    return false

  }
}
