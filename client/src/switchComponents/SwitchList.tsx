import React, { useState, useEffect, useContext, useCallback } from "react";
import { RxDropdownMenu } from "react-icons/rx";
import { getSwitches } from "../services";
import SwitchModule from "./SwitchModule";
import { AuthorizationContext } from "../contexts/AuthorizationContext";
import { SwitchModuleContext } from "../contexts/SwitchModuleContext";
import { useLocation } from "react-router-dom";
export interface SwitchInterface {
  id: string;
  name: string;
  onStatus: boolean;
}

const SwitchesList: React.FC = () => {
  const authorizationContext = useContext(AuthorizationContext);
  const [switches, setSwitches] = useState<{ switches: SwitchInterface[] }>({
    switches: [],
  });

  const location = useLocation();
  const { search } = location;
  const paramsInUrl = new URLSearchParams(search);
  const showSwitcherParamFromUrl = paramsInUrl.get("showSwitchesParam");
  const showSwitchesDefaultValue = showSwitcherParamFromUrl === "true";

  const [showSwitches, setShowSwitches] = useState<boolean>(
    showSwitchesDefaultValue
  );
  const [refreshList, setRefreshList] = useState(false);
  const token = localStorage.getItem("token");

  const getSwitchList = useCallback(async () => {
    const response = await getSwitches(token);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    if (response.status === 401) {
      authorizationContext.setLoggedIn(false);
      return;
    }
  }, [authorizationContext, token]);

  useEffect(() => {
      setRefreshList(true)
    },[showSwitches]);

  useEffect(() => {
    
    if (switches.switches.length === 0 || refreshList) {
      getSwitchList().then((data) => {
        setSwitches({ switches: data });
        setRefreshList(false);
      });
    }

  }, [
    refreshList,
    getSwitchList,
    switches.switches.length,
    switches.switches,
  ]);

  return (
    <div className="flex-col h-full items-center justify-center border-5 border-sky-500">
      <button
        onClick={() =>
          showSwitches ? setShowSwitches(false) : setShowSwitches(true)
        }
        className="w-full flex flex-row h-6 mb-4 mt-0 items-center justify-center bg-[#0F28FA] text-white text-lg font-semibold"
      >
        <div className="basis-1/2">Switches</div>
        <RxDropdownMenu className="basis-1/2"></RxDropdownMenu>
      </button>

      <div className=" overflow-y-auto ">
        {showSwitches
          ? switches.switches.map((switchDevice: SwitchInterface) => {
              return (
                <div key={switchDevice.id}>
                  <SwitchModuleContext.Provider
                    value={{
                      switchDevice,
                      setRefreshList,
                    }}
                  >
                    <SwitchModule></SwitchModule>
                  </SwitchModuleContext.Provider>
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
};

export default SwitchesList;
