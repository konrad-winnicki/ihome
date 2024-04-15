import PropertiesReader, { Value } from "properties-reader";
import { choosePropertyFile } from "../src/propertyWriter";
import { prepareAppProperties as prepareProductionPropertyFile } from "../src/prepareAppProperties";
import { getNodeEnvType } from "./getNodeEnvType";
import fs from "node:fs/promises";
import * as sync from "node:fs";

export type PersistenceType = "DATABASE" | "FILE";

interface COMMON_CONFIGURATION {
  PASSWORD: string;
  PERSISTENCIA: PersistenceType; // TODO: rename
  PORT: number;
  JWT_SECRET: string;
  SERVER_TYPE: string;
  SWITCH_REPLY_TIMEOUT: number;
}
export interface DATABASE_CONFIGURATION extends COMMON_CONFIGURATION {
  DATABASE_URL: string;
  DATABASE: string;
}

export interface FILE_CONFIGURATION extends COMMON_CONFIGURATION {}

const ENVIRONMENT = getNodeEnvType();

class EnvAwarePropertiesReader {
  private properties: PropertiesReader.Reader;
  constructor(properties: PropertiesReader.Reader) {
    this.properties = properties;
  }
  get(propertyName: string): Value | null {
    const env = process.env[propertyName];
    return env ? env : this.properties.get(propertyName);
  }
}

async function prepareApplicationProperties() {
  await assureProductionPropertiesFileExists();
  const propertiesPath = choosePropertyFile(ENVIRONMENT);
  const propertiesReader = PropertiesReader(propertiesPath, undefined, {
    writer: { saveSections: true },
  });
  const properties = new EnvAwarePropertiesReader(propertiesReader);

  if (ENVIRONMENT === "production") {
    await prepareProductionPropertyFile(propertiesReader, propertiesPath);
  }

  return getConfiguration(properties);
}

const getConfiguration = (
  properties: EnvAwarePropertiesReader
): DATABASE_CONFIGURATION | FILE_CONFIGURATION => {
  const commonProperties = {
    PASSWORD: parseString("password", properties.get("PASSWORD")),
    PERSISTENCIA: parseString("persistencia", properties.get("PERSISTENCIA")),
    PORT: parseNumber("port", properties.get("PORT")),
    JWT_SECRET: parseString("jwt secret", properties.get("JWT_SECRET")),
    SERVER_TYPE: parseString("server type", properties.get("SERVER_TYPE")),
    SWITCH_REPLY_TIMEOUT: parseNumber(
      "switch reply timeout",
      properties.get("SWITCH_REPLY_TIMEOUT")
    ),
  };
  const customProperties =
    properties.get("PERSISTENCIA") === "DATABASE"
      ? {
          ...commonProperties,
          DATABASE_URL: parseString(
            "database url",
            properties.get("DATABASE_URL")
          ),
          DATABASE: parseString("database name", properties.get("DATABASE")),
          PERSISTENCIA: "DATABASE" as PersistenceType,
        }
      : { ...commonProperties, PERSISTENCIA: "FILE" as PersistenceType };

  return customProperties;
};

function parseString(name: string, value: Value | null): string {
  if (!value) {
    throw Error(`Missing value for ${name}`);
  }
  return value.toString();
}

function parseNumber(name: string, value: Value | null): number {
  if (!value) {
    throw Error(`Missing value for ${name}`);
  }
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    throw Error(`Value for ${name} should be a number`);
  }
  return Number(value);
}

async function assureProductionPropertiesFileExists() {
  if (sync.existsSync("./src/properties/app.properties")) {
    return "File exists";
  }
  const dataToWrite = "";
  return fs
    .writeFile("./src/properties/app.properties", dataToWrite)
    .catch((err) => {
      console.log("Error during construction app.propersties file:", err);
      throw new Error("Error during construction app.propersties file");
    });
}

export default prepareApplicationProperties;
