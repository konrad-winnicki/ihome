import { createContext} from "react";
import { SwitchInterface } from "../switchComponents/SwitchList";

export type TaskModuleContextValue = {
  switchDevice: SwitchInterface;
  setDeviceShowTaskModule: (newParam: SwitchInterface|null) => void
  setShowSwitches: (newParam: boolean) => void
};



export const TaskModuleContext = createContext<TaskModuleContextValue>({
  switchDevice: {id:"", name:"", onStatus:false},
  setDeviceShowTaskModule: () => {},
  setShowSwitches: () => {},
});


