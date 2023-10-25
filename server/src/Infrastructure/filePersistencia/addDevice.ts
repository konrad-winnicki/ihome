
import { Device } from "../../domain/Device";
import { findIfIdExists, findIfNameExists, readFile, writeFile } from "./auxilaryFunctions";


export async function addDeviceToFile(device:Device
): Promise<string> {
  

  return readFile("devices.json")
    .then((fileContent) => {
      
      const isDeviceExisting = findIfIdExists(fileContent, device.id);
      console.log(isDeviceExisting)
      if (isDeviceExisting){
        throw new Error(`Key ${device.id} already exists`);
      }
      findIfNameExists(fileContent, device.name);
      fileContent[device.id] = device;
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
