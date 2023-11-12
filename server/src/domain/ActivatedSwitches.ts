export class ActivatedSwitches {
  private static instance: ActivatedSwitches | null = null;
  private _switchDevices: Array<string>;
  private constructor() {
    this._switchDevices = [];
  }

  public static getInstance() {
    if (!ActivatedSwitches.instance) {
      ActivatedSwitches.instance = new ActivatedSwitches();
    }
    return ActivatedSwitches.instance;
  }

  public add(switchId: string) {
    const switchToAdd = this._switchDevices.indexOf(switchId);
    if (switchToAdd === -1) {
      this._switchDevices.push(switchId);
    }
  }

  public delete(switchId: string) {
    const switchToRemove = this._switchDevices.indexOf(switchId);

    if (switchToRemove !== -1) {
      this._switchDevices.splice(switchToRemove, 1);
    }
  }

  public get switchDevices(): Array<string> {
    return this._switchDevices;
  }
}
