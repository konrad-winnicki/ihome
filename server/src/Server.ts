import { applicationStart } from "./app";
import { RoomOccupancyManager } from "./domain/RoomOccupancyManager";

export const roomsOccupancy = new RoomOccupancyManager();

applicationStart();
