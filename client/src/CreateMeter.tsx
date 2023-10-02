import React, { useEffect, useState } from "react";
import { createMeter } from "./services";
import { useNavigate } from "react-router-dom";
import { Parameters } from "./MetersList";

export type CreateMeterProps = {
  setInstall: (param: string|null) => void;
  
}
export const CreateMeter: React.FC <CreateMeterProps>= (props) => {
  const [formData, setFormData] = useState({
    name: '',
    parameterString: '',
    unitString: '',
    commandOn: '',
  });

  const navigate = useNavigate();

  useEffect(()=>{
    console.log("form data", formData)

  })
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
    const parameters = parametersList.reduce((parameters: Parameters, parameterList, index) => {
      parameters[parameterList] = unitList[index];
      return parameters;
    }, {});
    const meter = {
      deviceType: "meter",
      name: formData.name,
      parameters,
      commandOn: formData.commandOn,
    };



    
    try {
      const response = await createMeter(meter);
      if (response.ok) {
        alert("Meter created");
        console.log(await response.json());
      }
      if (response.status == 409) {
        alert("Room name already in use");
      }
      if (response.status == 401) {
        navigate("/api/login");
      }
    } catch (error) {
      console.error("an error occurred:", error);
    }
    props.setInstall(null)
  };

  return (
    <div className=" w-full p-6 bg-white rounded-lg shadow-lg">
      <form className="form" onSubmit={handleSubmit}>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="email"
        >
          Introduce meter details
        </label>
        <div className="flex">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
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
        <div className="flex">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="parameterString"
          >
            Parameter name
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="parameterString"
            name="parameterString"
            onChange={handleInputChange}
          />
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="unitString"
          >
            Unit
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="unitString"
            name="unitString"
            onChange={handleInputChange}
          />
        </div>
        <div className="flex">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="commandOn"
          >
            CommandOn
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="commandOn"
            name="commandOn"
            onChange={handleInputChange}
            
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateMeter;
