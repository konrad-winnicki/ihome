
import { findIfIdExists, findIfNameExists, readFile, writeFile } from "./auxilaryFunctions";


export async function addDeviceToFile(data: {
  [key: string]: string;
}): Promise<string> {
  

  return readFile("devices.json")
    .then((fileContent) => {
      
      const isDeviceExisting = findIfIdExists(fileContent, data.id);
      console.log(isDeviceExisting)
      if (isDeviceExisting){
        throw new Error(`Key ${data.id} already exists`);
      }
      fileContent[data.id] = data;
      return writeFile("devices.json", fileContent).then(() =>
        Promise.resolve("Written succesfully")
      );
    })
    .catch((error) => {
      if (error instanceof Error) {
        return Promise.reject(error.message);
      }
      return Promise.reject(error);
    });
}
