import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleButton from 'react-google-button'


interface DecodedToken {
  userId: string;
  nickName: string;
}


const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigateRegistration = () => {
    navigate("/api/users");
  };

 useEffect(()=>console.log(formData))

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      console.log('ala')
      
    } catch (error) {
      console.error("an error occurred:", error);
    }
  };

  return (
    <div className="flex items-center mt-4 justify-center">
      <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-4 ">Login</h2>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            email2
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="email"
            name="email"
           // value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
       
        <button
          className="w-full mt-4 bg-blue-500 text-white py-2 px-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          onClick={navigateRegistration}
        >
          Registration
        </button>
        
      
        
      </form>
      
      
    </div>
  );
};

export default Login;
