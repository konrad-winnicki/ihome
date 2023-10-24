
import { findIfIdExists, readFile, writeFile } from "./auxilaryFunctions";



export async function deleteDeviceFromFile(id: string): Promise<string> {
  
  return readFile('devices.json')
    .then((fileContent) => {


      const isExisting = findIfIdExists(fileContent, id)
      if (!isExisting){
        throw new Error(`Device ${id} does not exists.`)

      }
      delete fileContent[id]
      
      return writeFile('devices.json', fileContent).then(() =>
        Promise.resolve("Deleted succesfully")
      )
    })
    .catch((error) => {
      if (error instanceof Error) {
        return Promise.reject(error.message);
      }
      return Promise.reject(error);
    });
}
