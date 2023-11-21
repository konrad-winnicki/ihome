import React, { useState, useEffect, useContext } from "react";
import { RxDropdownMenu } from "react-icons/rx";
import { getSwitches } from "../services";
import SwitchModule from "./SwitchModule";
import TaskList from "../taskComponents/TaskList";
import { AuthorizationContext } from "../contexts/AuthorizationContext";

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

  const [showSwitches, setShowSwitches] = useState<boolean>(false);
  const [deviceShowsTaskModule, setDeviceShowTaskModule] =
    useState<SwitchInterface | null>(null);
  const [refreshList, setRefreshList] = useState(false);

  const token = localStorage.getItem("token");

  async function getSwitchList() {
    const response = await getSwitches(token);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    if (response.status === 401) {
      authorizationContext.setLoggedIn(false);
      return;
    }
  }

  useEffect(() => {
    if (!showSwitches) {
      getSwitchList().then((data) => {
        setSwitches({ switches: data });
      });
    }
    if (deviceShowsTaskModule) {
      setShowSwitches(false);
    }

    if (refreshList) {
      setRefreshList(false);
    }
  }, [JSON.stringify(switches), showSwitches, deviceShowsTaskModule]);

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
                  <SwitchModule
                    switchDevice={switchDevice}
                    setShowTaskDetails={setDeviceShowTaskModule}
                    setRefreshList={setRefreshList}
                  ></SwitchModule>
                </div>
              );
            })
          : ""}
      </div>

      <div className="flex-row">
        {deviceShowsTaskModule ? (
          <TaskList
            setDeviceShowTaskModule={setDeviceShowTaskModule}
            setShowSwitches={setShowSwitches}
            device={deviceShowsTaskModule}
          ></TaskList>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default SwitchesList;
