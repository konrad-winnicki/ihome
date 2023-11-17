import React, { useState, useEffect, useCallback } from "react";
import Sensor, { SensorDescription } from "./Sensor";
import { getSensors} from "./services";
import SensorDisplay from "./SensorDisplay";
import { RxDropdownMenu } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router-dom";

const SensorList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sensors, setSensors] = useState<SensorDescription[]>([]);
  const [displayData, setDisplayData] = useState<string[]>([]);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [refreshList, setRefreshList] = useState(false);

  const token = localStorage.getItem("token");

  const fetchSensors = useCallback(async () => {
    console.log(location);
    const response = await getSensors(token);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    if (response.status === 401) {
    navigate('/', {replace:true})
      
    }
  }, [token, location]);

  useEffect(() => {
    fetchSensors().then((meters) => {
      setSensors(meters);
    });

    if (refreshList) {
      setRefreshList(false);
    }
  }, [showSensors, refreshList, fetchSensors]);
  /*
  if (statusCode === 401) {
    //return <div>Unauthorized. Please log in.</div>;
    //const url = prepareURL();
    navigate(`/api/login/`,{ replace: true });
    
  }*/

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
