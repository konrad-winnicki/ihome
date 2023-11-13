import React, { useState, useEffect, useCallback } from "react";
import { getMeters, prepareURL } from "./services";
import Meter, { MeterDescription } from "./Meter";
import MeterDisplay from "./MetersDisplay";
import { RxDropdownMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";


const MeterList: React.FC = () => {
  const navigate = useNavigate();


  const [meters, setMeters] = useState<MeterDescription[]>([]);
  const [displayData, setDisplayData] = useState<string[]>([]);
  const [showMeters, setShowMeters] = useState<boolean>(true);
  const [refreshList, setRefreshList] = useState(false);
  const [statusCode, setStatusCode] = useState<number|null>(null);

  const token = localStorage.getItem("token");

  const fetchMeters = useCallback(async () => {
    const response = await getMeters(token);
    console.log('SSSSS', response.status)
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    if(response.status === 401){
      setStatusCode(401)
      
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchMeters().then((meters) => {
      setMeters(meters);
    });

    if (refreshList) {
      setRefreshList(false);
    }
  }, [showMeters, refreshList, fetchMeters]);

  if (statusCode === 401) {
    //return <div>Unauthorized. Please log in.</div>;
    const url = prepareURL()
    navigate(`${url}`)

  }

  return (
    <div className="flex-col h-full items-center justify-center border-5 border-sky-500">
      <MeterDisplay displayData={displayData}></MeterDisplay>
      <button
        className="w-full h-6 mb-2 flex flex-row items-center justify-center bg-[#0F28FA] text-white text-lg font-semibold"
        onClick={() =>
          showMeters ? setShowMeters(false) : setShowMeters(true)
        }
      >
        <div className="basis-1/2">Meters</div>
        <RxDropdownMenu className="basis-1/2"></RxDropdownMenu>
      </button>
      <div className="overflow-y-auto">
        {showMeters
          ? meters.map((meter: MeterDescription) => {
              return (
                <div key={meter.id}>
                  <Meter
                    meter={meter}
                    setDisplayData={setDisplayData}
                    setRefreshList={setRefreshList}
                  ></Meter>
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
};

export default MeterList;
