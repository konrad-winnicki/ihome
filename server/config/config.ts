import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "../.env") });
//console.log(path.resolve(process.cwd(), ".env") )

// Interface to load env variables

interface ENV {
  CLIENT_ID: string|undefined;
CLIENT_SECRET: string | undefined;
REDIRECT_URL: string |undefined;
  NODE_ENV: string | undefined;
  PORT: number | undefined;
  MONGO_URI: string | undefined;
  DATABASE: string | undefined;
  TEST_DATABASE: string | undefined;
  JWT_SECRET: string | undefined;
}

interface Config {
  CLIENT_ID: string
CLIENT_SECRET: string
REDIRECT_URL: string
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  DATABASE: string;
  TEST_DATABASE: string;
  JWT_SECRET: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    CLIENT_ID: process.env.CLIENT_ID,
CLIENT_SECRET: process.env.CLIENT_SECRET,
REDIRECT_URL: process.env.REDIRECT_URL,
    DATABASE: process.env.DATABASE,
    NODE_ENV: process.env.NODE_ENV,
    TEST_DATABASE: process.env.TEST_DATABASE,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  };
};

const getSanitizedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitizedConfig(config);

export default sanitizedConfig;
