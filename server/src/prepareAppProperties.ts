import { v4 } from "uuid";
import { changeExistingProperties, collectUserData } from "./prompt/prompts";
import PropertiesReader from "properties-reader";
import { propertyWriter } from "./propertyWriter";

import { checkIfNotMissingParams } from "./Infrastructure/middleware/guardMiddleware/guardHelpers/guardFunctionHelpers";

function checkIfValidPropertyFile(properties: PropertiesReader.Reader) {
  const expectedDatabaseParameters = [
    "PASSWORD",
    "PERSISTENCIA",
    "PORT",
    "JWT_SECRET",
    "DATABASE_URL",
    "DATABASE",
  ];
  const expectedFileParameters = [
    "PASSWORD",
    "PERSISTENCIA",
    "PORT",
    "JWT_SECRET",
  ];

  if (properties.get("PERSISTENCIA") === "mongoDatabase") {
    return checkIfNotMissingParams(
      properties.getAllProperties(),
      expectedDatabaseParameters
    );
  }

  if (properties.get("PERSISTENCIA") === "file") {
    return checkIfNotMissingParams(
      properties.getAllProperties(),
      expectedFileParameters
    );
  }
  return false;
}

export async function prepareAppProperties(
  properties: PropertiesReader.Reader,
  propertiesPath: string
) {
  const fileIsInvalid = !checkIfValidPropertyFile(properties);
  const collectProperties = fileIsInvalid || (await userWantsToRecreate());

  if (collectProperties) {
    return collectUserData()
      .then((response) => {
        const responseKeys = Object.keys(response);
        responseKeys.forEach((key) => properties.set(key, response[key]));
        properties.set("JWT_SECRET", v4());
        return propertyWriter(properties, propertiesPath);
      })
      .catch((err) => {
        console.log("err", err);
        process.exit(1);
      });
  }

  async function userWantsToRecreate() {
    return changeExistingProperties()
      .then((result) => result.PROPERTY_CHANGE_CONFIRMATION)
      .catch((err) => {
        console.log("err", err);
        process.exit(1);
      });
  }
}
