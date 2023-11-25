import { createContext} from "react";
import { SwitchInterface } from "../switchComponents/SwitchList";

/*
type Props = {
  children?: ReactNode;
};
*/
export type SwitchModuleContextValue = {
  switchDevice: SwitchInterface;
  setDeviceShowTaskModule: (newParam: SwitchInterface|null) => void
  setRefreshList: (newParam: boolean) => void
};

export const SwitchModuleContext = createContext<SwitchModuleContextValue>({
  switchDevice: {id:"", name:"", onStatus:false},
  setDeviceShowTaskModule: () => {},
  setRefreshList: () => {}
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
