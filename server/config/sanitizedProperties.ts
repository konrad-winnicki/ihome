import PropertiesReader, { Value } from "properties-reader";
import { choosePropertyFile } from "../src/propertyWriter";
import sanitizedConfig from "./config";
import { prepareAppProperties as prepareProductionPropertyFile } from "../src/prepareAppProperties";

interface DATABASE_PROPERTIES {
  PASSWORD: Value | null;
  PERSISTENCIA: Value | null;
  PORT: Value | null;
  JWT_SECRET: Value | null;
  DATABASE_URL: Value | null;
  DATABASE: Value | null;
}

interface FILE_PROPERTIES {
  PASSWORD: Value | null;
  PERSISTENCIA: Value | null;
  PORT: Value | null;
  JWT_SECRET: Value | null;
}

export interface DATABASE_CONFIGURATION {
  PASSWORD: string;
  PERSISTENCIA: string;
  PORT: number;
  JWT_SECRET: string;
  DATABASE_URL: string;
  DATABASE: string;
}

export interface FILE_CONFIGURATION {
  PASSWORD: string;
  PERSISTENCIA: string;
  PORT: number;
  JWT_SECRET: string;
}
const ENVIRONMENT = sanitizedConfig.NODE_ENV;

async function prepareApplicationProperties() {
  const propertiesPath = choosePropertyFile(ENVIRONMENT);
  const properties = PropertiesReader(propertiesPath, undefined, {
    writer: { saveSections: true },
  });

  if (ENVIRONMENT === "production") {
    await prepareProductionPropertyFile(properties, propertiesPath);
  }

  const getConfiguration = (): DATABASE_PROPERTIES | FILE_PROPERTIES => {
    let readedProperties: DATABASE_PROPERTIES | FILE_PROPERTIES;
    if (properties.get("PERSISTENCIA") === "mongoDatabase") {
      readedProperties = {
        PASSWORD: properties.get("PASSWORD"),
        PERSISTENCIA: properties.get("PERSISTENCIA"),
        PORT: properties.get("PORT"),
        JWT_SECRET: properties.get("JWT_SECRET"),
        DATABASE_URL: properties.get("DATABASE_URL"),
        DATABASE: properties.get("DATABASE"),
      };
    } else {
      readedProperties = {
        PASSWORD: properties.get("PASSWORD"),
        PERSISTENCIA: properties.get("PERSISTENCIA"),
        PORT: properties.get("PORT"),
        JWT_SECRET: properties.get("JWT_SECRET"),
      };
    }
    return readedProperties;
  };

  const setAppConfiguration = (
    config: DATABASE_PROPERTIES | FILE_PROPERTIES
  ): DATABASE_CONFIGURATION & FILE_CONFIGURATION => {
    for (const [key, value] of Object.entries(config)) {
      if (value === null) {
        throw new Error(
          `Missing key ${key} in .properties. \n Path to file: ${propertiesPath}`
        );
      }
    }
    return config as DATABASE_CONFIGURATION & FILE_CONFIGURATION;
  };

  const config = getConfiguration();
  return setAppConfiguration(config);
}

export default prepareApplicationProperties;
