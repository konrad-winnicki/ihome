import fs from "fs/promises";
import * as sync from "node:fs";
import { Device } from "../../domain/Device";


export async function writeFile(path: string, data: object) {
    try {
      const content = JSON.stringify(data);
      await fs.writeFile(path, content);
    } catch (err) {
      console.log(err);
    }
  }
  
  export async function readFile(path:string){
      if (!sync.existsSync("devices.json")) {
          await writeFile(path, {});
        }
      return fs
      .readFile(path, "utf-8")
      .then((fileContent) => {
        const jsonObject = JSON.parse(fileContent)
      return Promise.resolve(jsonObject)
      }).catch((error)=>Promise.reject(error))
  }
  
  
  export function findIfIdExists(
    content: { [key: string]: string },
    searchedKey: string
  ) {
    const findResult = content[searchedKey];
    if (findResult) {
      return true
    }
    return false;
  }
  
  export function findIfNameExists(
    content: { [key: string]: Device },
    searchedValue: string
  ) {
    const keysValues = Object.entries(content);
    keysValues.forEach((keyValue) => {
      const [key, value] = keyValue;
      if (value.name === searchedValue) {
        throw new Error(`Device name ${searchedValue} already exists`);
      }
    });
    return false;
  }
  