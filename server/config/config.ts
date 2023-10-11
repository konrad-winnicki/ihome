import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface ENV {
  PAIR_PASSWORD: string | undefined;
  EXCHANGE_TOKEN_URI: string | undefined;
  NODE_ENV: string | undefined;
  PORT: number | undefined;
  MONGO_URI: string | undefined;
  DATABASE: string | undefined;
  TEST_DATABASE: string | undefined;
  JWT_SECRET: string | undefined;
}

interface Config {
  PAIR_PASSWORD: string;
  EXCHANGE_TOKEN_URI: string;
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  DATABASE: string;
  TEST_DATABASE: string;
  JWT_SECRET: string;
}


const getConfig = (): ENV => {
  return {
    PAIR_PASSWORD: process.env.PAIR_PASSWORD,
    EXCHANGE_TOKEN_URI: process.env.EXCHANGE_TOKEN_URI,
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
    //console.log(Object.entries(config))
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitizedConfig(config);

export default sanitizedConfig;
