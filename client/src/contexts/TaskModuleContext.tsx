import { createContext} from "react";
import { SwitchInterface } from "../switchComponents/SwitchList";

/*
type Props = {
  children?: ReactNode;
};
*/
export type TaskModuleContextValue = {
  switchDevice: SwitchInterface;
  setDeviceShowTaskModule: (newParam: SwitchInterface|null) => void
  setShowSwitches: (newParam: boolean) => void
};



export const TaskModuleContext = createContext<TaskModuleContextValue>({
  switchDevice: {id:"", name:"", onStatus:false},
  setDeviceShowTaskModule: () => {},
  setShowSwitches: () => {}
});

/*
export const SwitchModuleContextProvider = ({ children }: Props) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  return (
    <div>
      <SwitchModuleContext.Provider
        value={{ isLoggedIn, setLoggedIn: setLoggedIn }}
      >
        {children}
      </SwitchModuleContext.Provider>
    </div>
  );
};*/
