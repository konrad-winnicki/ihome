import React, { useEffect, useState } from "react";

export type CreateSwitchProps = {
  setAddSettings: (param: string | null) => void;
};

export const SetIP: React.FC<CreateSwitchProps> = (props) => {
  const [ip, setIp] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    localStorage.setItem(name, value);
    setIp(value)
  };

  useEffect(() => {
    const ipStorage = localStorage.getItem("ip");
    const validIp = ipStorage ? ipStorage : "";
    setIp(validIp);
  }, [ip]);

  return (
    <div className=" w-full p-6 bg-white rounded-lg">
      <form className="form">
        <div className=" flex m-2 items-center justify-center">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="ip"
          >
            IP
          </label>

          <input
            className="w-full w-1/2 p-2 m-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="ip"
            name="ip"
            value={ip}
            onChange={handleInputChange}
          />
        </div>
        <div className=" flex m-2 items-center justify-center">
          <button
            className="w-1/4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            type="submit"
            onClick={() => props.setAddSettings(null)}
          >
            Set
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetIP;
