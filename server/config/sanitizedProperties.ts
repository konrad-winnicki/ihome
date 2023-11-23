import PropertiesReader, { Value } from "properties-reader";
import { choosePropertyFile } from "../src/propertyWriter";
import { prepareAppProperties as prepareProductionPropertyFile } from "../src/prepareAppProperties";
import sanitizedConfig from "./config";
import fs from 'node:fs/promises'
import * as sync from "node:fs";

interface DATABASE_PROPERTIES {
  PASSWORD: Value | null;
  PERSISTENCIA: Value | null;
  PORT: Value | null;
  JWT_SECRET: Value | null;
  DATABASE_URL: Value | null;
  DATABASE: Value | null;
  SERVER_TYPE:Value|null

}

interface FILE_PROPERTIES {
  PASSWORD: Value | null;
  PERSISTENCIA: Value | null;
  PORT: Value | null;
  JWT_SECRET: Value | null;
  SERVER_TYPE:Value|null

}

export interface DATABASE_CONFIGURATION {
  PASSWORD: string;
  PERSISTENCIA: string;
  PORT: number;
  JWT_SECRET: string;
  DATABASE_URL: string;
  DATABASE: string;
  SERVER_TYPE:string;

}

export interface FILE_CONFIGURATION {
  PASSWORD: string;
  PERSISTENCIA: string;
  PORT: number;
  JWT_SECRET: string;
  SERVER_TYPE:string;
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
await prepareAppPropertiesFile()
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
        SERVER_TYPE: properties.get("SERVER_TYPE"),
      };
    } else {
      readedProperties = {
        PASSWORD: properties.get("PASSWORD"),
        PERSISTENCIA: properties.get("PERSISTENCIA"),
        PORT: properties.get("PORT"),
        JWT_SECRET: properties.get("JWT_SECRET"),
        SERVER_TYPE: properties.get("SERVER_TYPE"),

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


async function prepareAppPropertiesFile() {
  if (sync.existsSync('./src/properties/app.properties')) {
    return 'File exists'
  }
  const dataTyWrite = ""
  return fs
      .writeFile('./src/properties/app.properties', dataTyWrite)
      .catch((err) => {
        console.log('Error during construction app.propersties file:', err)
        throw new Error('Error during construction app.propersties file')})
}

export default prepareApplicationProperties;
