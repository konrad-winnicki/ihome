import { Connection } from "mongoose";

export async function getDevice(databaseConnection:Connection, deviceId:string){
    const database = databaseConnection.useDb('raspberrypi_test')
    const collection = database.collection('devices')
    const response =   await collection.find({id: deviceId}).toArray()
return response
}