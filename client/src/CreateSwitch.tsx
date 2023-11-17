import React, { useEffect, useState } from "react";
import { createSwitch } from "./services";
import { useNavigate } from "react-router-dom";

export type CreateSwitchProps = {
  setAddSettings: (param: string | null) => void;
};

export const CreateSwitch: React.FC<CreateSwitchProps> = (props) => {
  const [formData, setFormData] = useState({
    name: "",
    commandOn: "",
    commandOff: "",
  });

  const navigate = useNavigate();

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

    const switchDevice = {
      deviceType: "switch",
      name: formData.name,
      commandOn: formData.commandOn,
      commandOff: formData.commandOff,
    };
    const token = localStorage.getItem("token");

    try {
      const response = await createSwitch(switchDevice, token);
      if (response.ok) {
        alert("Switch created");
        console.log(await response.json());
      }
      if (response.status == 409) {
        alert("Name already in use");
      }
      if (response.status == 403) {
        navigate("/login");
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
          htmlFor="switch"
        >
          Introduce switch details
        </label>
        <div className="flex mb-2 mt-2">
          <label
            className="w-1/4 block text-gray-700 text-sm font-bold mr-5"
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
            className="w-1/4 block text-gray-700 text-sm font-bold mr-2"
            htmlFor="commandOn"
          >
            Command On
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="commandOn"
            name="commandOn"
            onChange={handleInputChange}
          />
        </div>

        <div className="flex mb-2 mt-2">
          <label
            className="w-1/4 block text-gray-700 text-sm font-bold mr-2"
            htmlFor="commandOff"
          >
            Command Off
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="commandOff"
            name="commandOff"
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

export default CreateSwitch;
