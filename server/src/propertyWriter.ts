import PropertiesReader from "properties-reader";
import path from "node:path";

export function choosePropertyFile(environment: string) {
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

export const propertyWriter = async (
  properties: PropertiesReader.Reader,
  propertiesPath: string
) => {
  await properties.save(propertiesPath, function (error, _data) {
    if (error) {
      console.log("writer error", properties);
      console.error("Error saving properties:", error);
    } else {
      console.log("writer succes", properties);
      console.log("Properties file updated successfully.");
    }
  });
};
