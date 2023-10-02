import React, {  useEffect} from "react";

import { v4 } from "uuid";

export interface Parameters {
  [key: string]: string;
}

export interface MeterInterface {
  id: string;
  name: string;
  parameters: Parameters;
}

export interface MeasurementInterface {
  [key: string]: string;
}


const MeterDisplay: React.FC<{ displayData: string[] | [] }> = (props) => {
  useEffect(() => {
    console.log(props.displayData);
  }, [props.displayData]);

  return (
    <div className="grid grid-rows-2  m-4">
      {props.displayData
        ? props.displayData.map((displayItem) => {

          const id = v4()
            return (
              <div key={id}className="w-full bg-blue-700 p-2 text-white text-2l font-semibold m-2">
                {displayItem}
              </div>
            );
          })
        : ""}
    </div>
  );
};

export default MeterDisplay;
