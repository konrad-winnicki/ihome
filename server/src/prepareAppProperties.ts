import { v4 } from "uuid";
import { collectUserData } from "./prompt/prompts";
import PropertiesReader from "properties-reader";
import { propertyWriter } from "./propertyWriter";

export async function prepareAppProperties(
  properties: PropertiesReader.Reader,
  propertiesPath: string
) {
 
  return collectUserData()
    .then((response) => {
      const responseKeys = Object.keys(response);
      responseKeys.forEach(
        (key) => properties.set(key, response[key])
        //await propertyWriter(properties, propertiesPath, key, response[key])
      );
      properties.set("JWT_SECRET", v4());
      return propertyWriter(properties, propertiesPath);
    })
    .catch((err) => {
      console.log("err", err);
      process.exit(1);
    });
}
