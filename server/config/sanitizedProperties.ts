import PropertiesReader, { Value } from "properties-reader";
import { choosePropertyFile } from "../src/propertyWriter";
import { prepareAppProperties as prepareProductionPropertyFile } from "../src/prepareAppProperties";
import { getNodeEnvType } from "./config";
import fs from "node:fs/promises";
import * as sync from "node:fs";

// TODO: remove nulls here

interface COMMON_PROPERTIES {
  PASSWORD: Value | null;
  PERSISTENCIA: Value | null;
  PORT: Value | null;
  JWT_SECRET: Value | null;
  SERVER_TYPE: Value | null;
  SWITCH_REPLY_TIMEOUT: Value | null;
}
interface DATABASE_PROPERTIES extends COMMON_PROPERTIES {
  DATABASE_URL: Value | null;
  DATABASE: Value | null;
}

interface FILE_PROPERTIES extends COMMON_PROPERTIES {}

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

  const getConfiguration = (): DATABASE_PROPERTIES | FILE_PROPERTIES => {
    const commonProperties = {
      PASSWORD: properties.get("PASSWORD"),
      PERSISTENCIA: properties.get("PERSISTENCIA"),
      PORT: properties.get("PORT"),
      JWT_SECRET: properties.get("JWT_SECRET"),
      SERVER_TYPE: properties.get("SERVER_TYPE"),
      SWITCH_REPLY_TIMEOUT: properties.get("SWITCH_REPLY_TIMEOUT"),
    };
    const customProperties =
      properties.get("PERSISTENCIA") === "DATABASE"
        ? {
            ...commonProperties,
            DATABASE_URL: properties.get("DATABASE_URL"),
            DATABASE: properties.get("DATABASE"),
          }
        : commonProperties;

    console.log("PROPERTIES:", customProperties);
    return customProperties;
  };

  const setAppConfiguration = (
    config: DATABASE_PROPERTIES | FILE_PROPERTIES
  ): DATABASE_CONFIGURATION | FILE_CONFIGURATION => {
    for (const [key, value] of Object.entries(config)) {
      if (value === null) {
        throw new Error(
          `Missing key ${key} in .properties. \n Path to file: ${propertiesPath}`
        );
      }
    }

    const persistenceType = parseString(
      "persistencia",
      config.PERSISTENCIA
    ) as PersistenceType;
    const commonProperties = {
      PASSWORD: parseString("password", config.PASSWORD),
      PERSISTENCIA: persistenceType,
      PORT: parseNumber("port", config.PORT),
      JWT_SECRET: parseString("jwt secret", config.JWT_SECRET),
      SERVER_TYPE: parseString("server type", config.SERVER_TYPE),
      SWITCH_REPLY_TIMEOUT: parseNumber(
        "switch reply timeout",
        config.SWITCH_REPLY_TIMEOUT
      ),
    };
    return persistenceType === "DATABASE"
      ? createDatabaseConfiguration(
          commonProperties,
          config as DATABASE_CONFIGURATION
        )
      : commonProperties;
  };

  const config = getConfiguration();
  return setAppConfiguration(config);
}

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
  //return 1
  return Number(value) as number; // TODO: test if it's not
}

function createDatabaseConfiguration(
  commonProperties: COMMON_CONFIGURATION,
  config: DATABASE_PROPERTIES
) {
  return {
    ...commonProperties,
    DATABASE_URL: parseString("database url", config.DATABASE_URL),
    DATABASE: parseString("database name", config.DATABASE),
  };
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
