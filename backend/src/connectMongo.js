import { MongoClient } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

export function connectMongo() {
    const mongoUser = getEnvVar("MONGO_USER");
    const mongoPwd = getEnvVar("MONGO_PWD");
    const mongoCluster = getEnvVar("MONGO_CLUSTER");
    const dbName = getEnvVar("DB_NAME");

    const uri = `mongodb+srv://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPwd)}@${mongoCluster}/${dbName}?retryWrites=true&w=majority`;
    return new MongoClient(uri);
}
