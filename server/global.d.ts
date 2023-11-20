import {
  DATABASE_CONFIGURATION,
  FILE_CONFIGURATION,
} from "./config/sanitizedProperties";

declare global {
  // eslint-disable-next-line no-var
  var appConfiguration: DATABASE_CONFIGURATION & FILE_CONFIGURATION;
}

export {};
