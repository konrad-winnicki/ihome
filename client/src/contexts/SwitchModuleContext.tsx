import { createContext} from "react";
import { SwitchInterface } from "../switchComponents/SwitchList";

export type SwitchModuleContextValue = {
  switchDevice: SwitchInterface;
  setDeviceShowTaskModule: (newParam: SwitchInterface|null) => void
  setRefreshList: (newParam: boolean) => void
  setShowSwitches: (newParam: boolean) => void
  showSwitches:boolean
};

export const SwitchModuleContext = createContext<SwitchModuleContextValue>({
  switchDevice: {id:"", name:"", onStatus:false},
  setDeviceShowTaskModule: () => {},
  setRefreshList: () => {},
  setShowSwitches:() => {},
  showSwitches:false
  
});


