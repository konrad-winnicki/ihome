export class RoomOccupancyMapManager {
    private _map: Map<string, Array<string>>;
    constructor(map: Map<string, Array<string>>) {
      this._map = map;
    }
  
    addItemToMap(key: string, value: string) {
      const existingArray = this._map.get(key) || [];
      existingArray.push(value);
      this._map.set(key, existingArray);
    }
  
    deleteItemFromMap(key: string, value: string) {
      const existingArray = this._map.get(key) || [];
      const newArray = existingArray.filter(
        (participant) => participant != value
      );
      this._map.set(key, newArray);
    }
  
    get map(): Map<string, Array<string>> {
      return this._map;
    }
  }