import fs from "fs/promises";
import * as sync from "node:fs";
import { Device } from "../../domain/Device";

export class FileRepositoryHelpers {
  public async writeFile(path: string, data: object): Promise<void> {
    const contentToWrite = JSON.stringify(data);
    return fs
      .writeFile(path, contentToWrite)
      .catch((err) => Promise.reject({ ["Write file error"]: err }));
  }

  //czy lepiej zwracac generyczny object czy Task | Device
  public async readFile(path: string): Promise<{ [key: string]: object}> {
    if (!sync.existsSync(path)) {
      await this.writeFile(path, {});
    }
    return fs
      .readFile(path, "utf-8")
      .then((fileContent) => {
        const fileContentInJSON = JSON.parse(fileContent);
        return Promise.resolve(fileContentInJSON);
      })
      .catch((error) => Promise.reject({ ["Read file error"]: error }));
  }

  public findByIdInFile(fileContent: { [key: string]: object}, searchedKey: string): object | null {
    const foundValue = fileContent[searchedKey];
    if (foundValue) {
      return foundValue;
    }
    return null;
  }
 
  public findIfDeviceNameExists(
    fileContent: { [key: string]: Device },
    searchedName: string
  ): Device|undefined {
    const devices = Object.values(fileContent);
    const device = devices.find((device)=> device.name === searchedName)
    return device
  }
}
