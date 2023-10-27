import PropertiesReader from "properties-reader";
import path from "node:path";
import sanitizedConfig from "../config/config";

export function readPropertyFile(environment:string) {
  switch (environment) {
    case "production":
      return path.resolve(process.cwd(), "src/properties/app.properties");
    case "test_api_database":
      return path.resolve(
        process.cwd(),
        "src/properties/testDatabase.properties"
      );
    case "test_api_file":
      return path.resolve(process.cwd(), "src/properties/testFile.properties");
    case "dev_database":
      return path.resolve(
        process.cwd(),
        "src/properties/development_database.properties"
      );
    case "dev_file":
      return path.resolve(
        process.cwd(),
        "src/properties/development_file.properties"
      );
    default:
      throw new Error("NODE_ENV not recognized");
  }
}

/*
const propertiesPath = readPropertyFile(environmenr);

export const properties = PropertiesReader(propertiesPath, undefined, {
  writer: { saveSections: true },
});
*/
export const propertyWriter = (properties:PropertiesReader.Reader, propertiesPath:string, key: string, value: string) => {
  properties.set(key, value);
  properties.save(propertiesPath, function (error, _data) {
    if (error) {
      console.error("Error saving properties:", error);
    } else {
      console.log("Properties file updated successfully.");
    }
  });
};
