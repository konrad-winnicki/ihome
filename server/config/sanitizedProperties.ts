import PropertiesReader, { Value } from "properties-reader";
import { choosePropertyFile } from "../src/propertyWriter";
import { prepareAppProperties as prepareProductionPropertyFile } from "../src/prepareAppProperties";
import sanitizedConfig from "./config";

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
  const propertiesPath = choosePropertyFile(ENVIRONMENT);
  const propertiesReader = PropertiesReader(propertiesPath, undefined, {
    writer: { saveSections: true },
  });
  const properties = new EnvAwarePropertiesReader(propertiesReader);

  if (ENVIRONMENT === "production") {
    await prepareProductionPropertyFile(propertiesReader, propertiesPath);
  }

  const getConfiguration = (): DATABASE_PROPERTIES | FILE_PROPERTIES => {
    let readedProperties: DATABASE_PROPERTIES | FILE_PROPERTIES;
    if (properties.get("PERSISTENCIA") === "mongoDatabase") {
      readedProperties = {
        PASSWORD: properties.get("PASSWORD"),
        PERSISTENCIA: properties.get("PERSISTENCIA"),
        PORT: properties.get("PORT"),
        JWT_SECRET: properties.get("JWT_SECRET"),
        DATABASE_URL: process.env.DATABASE_URL
          ? process.env.DATABASE_URL
          : properties.get("DATABASE_URL"),
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
    console.log("PROPERTIES:", readedProperties);
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
