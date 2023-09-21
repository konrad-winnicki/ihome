export class RoomOccupancyManager {
  private _roomToPersons: Map<string, Array<string>>;
  constructor() {
    this._roomToPersons = new Map<string, Array<string>>();
  }

  addPersonToRoom(room: string, person: string) {
    const existingArray = this._roomToPersons.get(room) || [];
    existingArray.push(person);
    this._roomToPersons.set(room, existingArray);
  }

  deletePersonFromRoom(room: string, person: string) {
    const existingArray = this._roomToPersons.get(room) || [];
    const newArray = existingArray.filter(
      (participant) => participant != person
    );
    this._roomToPersons.set(room, newArray);
  }

  get roomToPerson(): Map<string, Array<string>> {
    return this._roomToPersons;
  }
}
