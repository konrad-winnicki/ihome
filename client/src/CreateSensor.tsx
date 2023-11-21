import React, { useContext, useEffect, useState } from "react";
import { createSensor as createSensor } from "./services";
import { AuthorizationContext } from "./App";

export interface Parameters {
  [key: string]: string;
}
export type CreateMeterProps = {
  setAddSettings: (param: string | null) => void;
};
export const CreateSensor: React.FC<CreateMeterProps> = (props) => {
  const [formData, setFormData] = useState({
    name: "",
    parameterString: "",
    unitString: "",
    commandOn: "",
  });
  const authorizationContext = useContext(AuthorizationContext);

  useEffect(() => {
    console.log("form data", formData);
  });
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parametersList = formData.parameterString.split(",");
    const unitList = formData.unitString.split(",");
    const parameters = parametersList.reduce(
      (parameters: Parameters, parameterList, index) => {
        parameters[parameterList] = unitList[index];
        return parameters;
      },
      {}
    );
    const sensor = {
      deviceType: "sensor",
      name: formData.name,
      parameters,
      commandOn: formData.commandOn,
    };
    const token = localStorage.getItem("token");

    try {
      console.log("sensor", sensor);
      const response = await createSensor(sensor, token);
      console.log("respnse", response);
      if (response.ok) {
        alert("Sensor created");
        console.log(await response.json());
      }
      if (response.status == 409) {
        alert("Name already in use");
      }
      if (response.status === 401) {
        authorizationContext.setIsLoggedIn(false);
        return;
      }
    } catch (error) {
      console.error("an error occurred:", error);
    }
    props.setAddSettings(null);
  };

  return (
    <div className=" w-full p-2 bg-white rounded-lg shadow-lg">
      <form className="form" onSubmit={handleSubmit}>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="sensor"
        >
          Introduce sensor details
        </label>
        <div className="flex mb-2 mt-2">
          <label
            className="w-1/3 block text-gray-700 text-sm font-bold mr-2"
            htmlFor="name"
          >
            Name
          </label>

          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="name"
            name="name"
            onChange={handleInputChange}
          />
        </div>
        <div className="flex mb-2 mt-2">
          <label
            className=" w-1/3  text-gray-700 text-sm font-bold mr-2"
            htmlFor="parameterString"
          >
            Parameters name
          </label>
          <input
            className="w-full p-1 mr-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="parameterString"
            name="parameterString"
            onChange={handleInputChange}
          />
          <label
            className="w-1/5 block text-gray-700 text-sm font-bold mr-2"
            htmlFor="unitString"
          >
            Units
          </label>
          <input
            className="w-2/3 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="unitString"
            name="unitString"
            onChange={handleInputChange}
          />
        </div>
        <div className="flex mb-2 mt-2">
          <label
            className="w-1/3 block text-gray-700 text-sm font-bold mr-2"
            htmlFor="commandOn"
          >
            Command On
          </label>
          <input
            className="w-full border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="commandOn"
            name="commandOn"
            onChange={handleInputChange}
          />
        </div>
        <div className="w-full">
          <button
            className="w-1/2 items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            type="submit"
          >
            Submit
          </button>
        </div>
        <div className="w-full">
          <button
            className="w-1/2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            type="submit"
            onClick={() => props.setAddSettings(null)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSensor;
