import { DATABASE_CONFIGURATION } from "../../config/sanitizedProperties";
import { createMongoRepositories } from "./createMongoRepositories";
import { createFileRepositories } from "./createFileRepositories";

export async function chooseRepositoryType() {
  function throwUnknownPersistenceType(unknownType: never): never {
    throw new Error("Unknown persistence type: " + unknownType);
  }

  switch (appConfiguration.PERSISTENCIA) {
    case "DATABASE":
      return createMongoRepositories(
        appConfiguration as DATABASE_CONFIGURATION
      );
    case "FILE":
      return createFileRepositories();
    default:
      return throwUnknownPersistenceType(appConfiguration.PERSISTENCIA);
  }
}
