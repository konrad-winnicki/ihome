import { Connection } from "mongoose";

export async function getAllDevices(databaseConnection:Connection){
    const database = databaseConnection.useDb('raspberrypi_test')
    const collection = database.collection('devices')
    const response =   await collection.find({}).toArray()
return response
}