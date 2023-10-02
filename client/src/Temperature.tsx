import React, { useState, useEffect } from "react";
import { getMeasurement } from "./services";




const Temperature: React.FC= () => {
  const [temperature, setTemperature] = useState<string | null>(null);
  const [humidity, setHumidity] = useState<string | null>(null);

async function getTemperature(){
  setTemperature('Waiting...')
    setHumidity('Waiting...')
  const response = await getMeasurement()
  if(response.ok){
    const data = await response.json()
    setTemperature(data.temperature)
    setHumidity(data.humidity)

  }
  
}

  
  return (
    <div className="chatList flex items-center justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
      
      <div>Actual temperature: {temperature}</div>
      <div>Actual humidity: {humidity}</div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-2 rounded"
        onClick={() => {
          getTemperature();
        }}
      >
        Indoor temperature
      </button>
    </div>
  );
};

export default Temperature;
