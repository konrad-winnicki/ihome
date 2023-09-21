"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var RoomOccupancyMapManager_1 = require("../../src/domain/RoomOccupancyMapManager");
(0, globals_1.describe)("RoomOcupancyManager class test", function () {
    (0, globals_1.test)("Should add person to room", function () {
        var roomOccupancyManager = new RoomOccupancyMapManager_1.RoomOccupancyManager;
        roomOccupancyManager.addPersonToRoom("Room1", "Jose");
        roomOccupancyManager.addPersonToRoom("Room1", "Maria");
        roomOccupancyManager.addPersonToRoom("Room2", "Alex");
        var map = new Map();
        map.set("Room1", ["Jose", "Maria"]);
        map.set("Room2", ["Alex"]);
        (0, globals_1.expect)(roomOccupancyManager.roomToPerson).toEqual(map);
    });
    (0, globals_1.test)("Should delete person from room", function () {
        var roomOccupancyManager = new RoomOccupancyMapManager_1.RoomOccupancyManager;
        roomOccupancyManager.addPersonToRoom("Room1", "Jose");
        roomOccupancyManager.addPersonToRoom("Room1", "Maria");
        roomOccupancyManager.addPersonToRoom("Room2", "Alex");
        roomOccupancyManager.deletePersonFromRoom("Room1", "Jose");
        var map = new Map();
        map.set("Room1", ["Maria"]);
        map.set("Room2", ["Alex"]);
        (0, globals_1.expect)(roomOccupancyManager.roomToPerson).toEqual(map);
    });
    (0, globals_1.test)("Should not change map if person doesn't exist", function () {
        var roomOccupancyManager = new RoomOccupancyMapManager_1.RoomOccupancyManager;
        roomOccupancyManager.addPersonToRoom("Room1", "Jose");
        roomOccupancyManager.addPersonToRoom("Room1", "Maria");
        roomOccupancyManager.addPersonToRoom("Room2", "Alex");
        roomOccupancyManager.deletePersonFromRoom("Room1", "Felix");
        var map = new Map();
        map.set("Room1", ["Jose", "Maria"]);
        map.set("Room2", ["Alex"]);
        (0, globals_1.expect)(roomOccupancyManager.roomToPerson).toEqual(map);
    });
});
