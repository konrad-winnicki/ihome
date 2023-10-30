import fs from "fs/promises";
import * as sync from "node:fs";
import { Device } from "../../domain/Device";

export class FileRepositoryHelpers {
  async writeFile(path: string, data: object) {
    const content = JSON.stringify(data);
    return await fs
      .writeFile(path, content)
      .then(() => {
        Promise.resolve();
      })
      .catch((err) => Promise.reject({ error: err }));
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

  findTasksByDeviceId(content: { [key: string]: object }, searchedKey: string) {
    const resultValue = content[searchedKey];
    if (resultValue) {
      return resultValue;
    }
    return null;
  }

  findIfNameExists(content: { [key: string]: Device }, searchedName: string) {
    const devices = Object.values(content);
    for (const device of devices) {
      if (device.name === searchedName) {
        return true;
      }
    }
    return false;
  }
}
