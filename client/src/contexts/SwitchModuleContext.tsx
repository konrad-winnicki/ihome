import { createContext} from "react";
import { SwitchInterface } from "../switchComponents/SwitchList";

export type SwitchModuleContextValue = {
  switchDevice: SwitchInterface;
  setRefreshList: (newParam: boolean) => void
};

export const SwitchModuleContext = createContext<SwitchModuleContextValue>({
  switchDevice: {id:"", name:"", onStatus:false},
  setRefreshList: () => {},
  
});


