import { describe, test, expect } from "@jest/globals";
import { RoomOccupancyManager } from "../../src/domain/RoomOccupancyManager";
describe("RoomOcupancyManager class test", () => {
  test("Should add person to room", () => {
    const roomOccupancyManager = new RoomOccupancyManager();
    roomOccupancyManager.addPersonToRoom("Room1", "Jose");
    roomOccupancyManager.addPersonToRoom("Room1", "Maria");
    roomOccupancyManager.addPersonToRoom("Room2", "Alex");

    const map = new Map<string, Array<string>>();
    map.set("Room1", ["Jose", "Maria"]);
    map.set("Room2", ["Alex"]);
    expect(roomOccupancyManager.roomToPerson).toEqual(map);
  });
  test("Should delete person from room", () => {
    const roomOccupancyManager = new RoomOccupancyManager();
    roomOccupancyManager.addPersonToRoom("Room1", "Jose");
    roomOccupancyManager.addPersonToRoom("Room1", "Maria");
    roomOccupancyManager.addPersonToRoom("Room2", "Alex");

    roomOccupancyManager.deletePersonFromRoom("Room1", "Jose");

    const map = new Map<string, Array<string>>();
    map.set("Room1", ["Maria"]);
    map.set("Room2", ["Alex"]);
    expect(roomOccupancyManager.roomToPerson).toEqual(map);
  });

  test("Should not change map if person doesn't exist", () => {
    const roomOccupancyManager = new RoomOccupancyManager();
    roomOccupancyManager.addPersonToRoom("Room1", "Jose");
    roomOccupancyManager.addPersonToRoom("Room1", "Maria");
    roomOccupancyManager.addPersonToRoom("Room2", "Alex");

    roomOccupancyManager.deletePersonFromRoom("Room1", "Felix");

    const map = new Map<string, Array<string>>();
    map.set("Room1", ["Jose", "Maria"]);
    map.set("Room2", ["Alex"]);
    expect(roomOccupancyManager.roomToPerson).toEqual(map);
  });
});
