import React from "react";
import { v4 } from "uuid";

const MeterDisplay: React.FC<{ displayData: string[] }> = (props) => {
  return (
    <div className="grid grid-rows-2 m-2 items-center justify-center ">
      {props.displayData
        ? props.displayData.map((displayItem) => {
            const id = v4();
            return (
              <div
                key={id}
                className="bg-blue-700 p-2 text-white text-2l font-semibold m-2"
              >
                {displayItem}
              </div>
            );
          })
        : ""}
    </div>
  );
};

export default MeterDisplay;
