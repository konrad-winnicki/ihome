import React, { useState } from "react";


export type CreateSwitchProps = {
  setInstall: (param: string | null) => void;
};

export const SetIP: React.FC<CreateSwitchProps> = () => {
  const [formData, setFormData] = useState({
    ip: "",
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
    console.log(formData);
    
  };

  return (
    <div className=" w-full p-6 bg-white rounded-lg shadow-lg">
      <form className="form" onSubmit={handleSubmit}>
        <div className="flex">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="ip"
          >
            IP
          </label>

          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="ip"
            name="ip"
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

export default SetIP;
