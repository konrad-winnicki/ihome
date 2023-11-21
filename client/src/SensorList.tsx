import React, { useState, useEffect, useCallback, useContext } from "react";
import Sensor, { SensorDescription } from "./Sensor";
import { getSensors } from "./services";
import SensorDisplay from "./SensorDisplay";
import { RxDropdownMenu } from "react-icons/rx";
import { AuthorizationContext } from "./App";

const SensorList: React.FC = () => {
  const authorizationContext = useContext(AuthorizationContext);

  const [sensors, setSensors] = useState<SensorDescription[]>([]);
  const [displayData, setDisplayData] = useState<string[]>([]);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [refreshList, setRefreshList] = useState(false);

  const token = localStorage.getItem("token");

  const fetchSensors = useCallback(async () => {
    const response = await getSensors(token);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    if (response.status === 401) {
      authorizationContext.setIsLoggedIn(false);
    }
  }, [token, authorizationContext]);

  useEffect(() => {
    fetchSensors().then((meters) => {
      setSensors(meters);
    });

    if (refreshList) {
      setRefreshList(false);
    }
  }, [showSensors, refreshList, fetchSensors]);

  return (
    <div className="flex-col h-full items-center justify-center border-5 border-sky-500">
      <SensorDisplay displayData={displayData}></SensorDisplay>
      <button
        className="w-full h-6 mb-2 flex flex-row items-center justify-center bg-[#0F28FA] text-white text-lg font-semibold"
        onClick={() =>
          showSensors ? setShowSensors(false) : setShowSensors(true)
        }
      >
        <div className="basis-1/2">Sensors</div>
        <RxDropdownMenu className="basis-1/2"></RxDropdownMenu>
      </button>
      <div className="overflow-y-auto">
        {showSensors
          ? sensors.map((meter: SensorDescription) => {
              return (
                <div key={meter.id}>
                  <Sensor
                    sensor={meter}
                    setDisplayData={setDisplayData}
                    setRefreshList={setRefreshList}
                  ></Sensor>
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
};

export default SensorList;
