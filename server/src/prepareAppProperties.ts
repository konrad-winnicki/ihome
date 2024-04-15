import { v4 } from "uuid";
import { changeExistingProperties, collectUserData } from "./prompt/prompts";
import PropertiesReader from "properties-reader";
import { propertyWriter } from "./propertyWriter";
import { checkIfNotMissingParams } from "./Infrastructure/middleware/guardMiddleware/guardHelpers/guardFunctionHelpers";


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
        properties.set("SWITCH_REPLY_TIMEOUT", 60000);
        if (response.PERSISTENCIA === "DATABASE") {
          properties.set("DATABASE", "raspberrypi");
        }

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


function checkIfValidPropertyFile(properties: PropertiesReader.Reader) {
  const commonExpectedParameters = [
    "PASSWORD",
    "PERSISTENCIA",
    "PORT",
    "JWT_SECRET",
    "SERVER_TYPE",
    "SWITCH_REPLY_TIMEOUT",
  ];
  const expectedDatabaseParameters = [
    ...commonExpectedParameters,
    "DATABASE_URL",
    "DATABASE",
  ];
  const expectedFileParameters = commonExpectedParameters;

  if (properties.get("PERSISTENCIA") === "DATABASE") {
    return checkIfNotMissingParams(
      properties.getAllProperties(),
      expectedDatabaseParameters
    );
  }

  if (properties.get("PERSISTENCIA") === "FILE") {
    return checkIfNotMissingParams(
      properties.getAllProperties(),
      expectedFileParameters
    );
  }
  return false;
}