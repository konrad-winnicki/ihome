import React, { useState, useEffect } from "react";
import { RxDropdownMenu } from "react-icons/rx";
import { getSwitches, listRunningSwitches } from "./services";
import SwitchModule from "./SwitchModule";
import TaskList from "./TaskList";

export interface Parameters {
  [key: string]: string;
}

export interface SwitchInterface {
  id: string;
  name: string;
  onStatus: boolean;
}

const SwitchesList: React.FC = () => {
  const [switches, setSwitches] = useState<SwitchInterface[]>([]);
  const [runningSwitches, setRunningSwitches] = useState<[]>([]);

  const [showSwitches, setShowSwitches] = useState<boolean>(false);
  const [deviceShowsTaskModule, setDeviceShowTaskModule] =
    useState<SwitchInterface | null>(null);
  const [refreshList, setRefreshList] = useState(false);

  const token = localStorage.getItem("token");

  async function getSwitchList() {
    const response = await getSwitches(token);
    if (response.ok) {
      const data = await response.json();
      setSwitches(data);
    }
  }

  async function getRunning() {
    const response = await listRunningSwitches(token);
    if (response.ok) {
      const data = await response.json();
      setRunningSwitches(data);
      console.log("running", data, runningSwitches);
    }
  }

  useEffect(() => {
    if (!showSwitches) {
      getRunning();
    }
    if (showSwitches) {
      getSwitchList();
    }
    if (deviceShowsTaskModule) {
      setShowSwitches(false);
    }

    
    if (refreshList) {
      setRefreshList(false);
    }
  }, [showSwitches, deviceShowsTaskModule, refreshList]);

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
          ? switches.map((switchDevice: SwitchInterface) => {
              const isRunning = runningSwitches.find(
                (value) => value === switchDevice.id
              );

              return (
                <div key={switchDevice.id}>
                  <SwitchModule
                    switchDevice={switchDevice}
                    setShowTaskDetails={setDeviceShowTaskModule}
                    setRefreshList={setRefreshList}
                    onStatus={isRunning ? true : false}
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
            setShowSwitches= {setShowSwitches}
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
