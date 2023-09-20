import{ Connection} from "mongoose";

export async function cleanupDatabase(connection: Connection) {
    (await connection.db.collections()).forEach((collection) =>
      collection.deleteMany({})
    );
}
