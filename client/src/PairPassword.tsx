import React, { useEffect, useState } from "react";
import { fetchLogin, renewSession } from "./services";
import jwt_decode from "jwt-decode";

interface DecodedToken {
  sessionId: string;
  iat: number;
  exp: number;
}

type LoginType = {
  setIsLoggedIn: (param: boolean) => void;
};
export const PairPassword: React.FC<LoginType> = (props) => {
  const [formData, setFormData] = useState({
    password: "",
  });

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

    function renewToken(decodedToken: DecodedToken) {
      const currentTimestamp = Math.round(Date.now() / 1000);
      const remainingSeconds = decodedToken.exp - currentTimestamp;
      const timeout = (remainingSeconds - 300) * 1000;
      setTimeout(() => {
        const token = localStorage.getItem("token");
        renewSession(token)
          .then((response) => response.json())
          .then((data) => {
            localStorage.setItem("token", data.token);
          });
      }, timeout);
    }

    try {
      console.log(formData);
      const response = await fetchLogin(formData);
      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        const decodedToken: DecodedToken = jwt_decode(token);
        console.log("TOKEEEN", decodedToken.exp);
        localStorage.setItem("token", token);
        renewToken(decodedToken);

        console.log("login successful");
        props.setIsLoggedIn(true);
      } else {
        alert("Password incorrect");
        console.error("login failed");
      }
    } catch (error) {
      console.error("an error occurred:", error);
    }
  };

  return (
    <div className="max-h-[90vh]  w-full p-6 bg-white rounded-lg">
      <form className="form" onSubmit={handleSubmit}>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="password"
        >
          Introduce password to pair cliant and server
        </label>
        <div className="flex m-2 items-center justify-center">
          <label
            className= "block p-2 text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="w-full h-1/2 p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <button
            className="w-1/3  bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default PairPassword;
