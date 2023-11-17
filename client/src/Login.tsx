import React, { useState } from "react";
import { login, renewSession } from "./services";
import jwt_decode from "jwt-decode";

interface DecodedToken {
  sessionId: string;
  iat: number;
  exp: number;
}

type LoginType = {
  setIsLoggedIn: (param: boolean) => void;
};
export const Login: React.FC<LoginType> = (props) => {
  const [formData, setFormData] = useState({
    password: "",
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

    try {
      const response = await login(formData);
      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        localStorage.setItem("token", token);
        props.setIsLoggedIn(true);
        renewTokenTiming(token).then((token: string) => {
          logOutTiming(token, props);
        });
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
            className="block p-2 text-gray-700 text-sm font-bold mb-2"
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

function calculateTimeToFinishToken(token: DecodedToken) {
  const milisecondsPerSecond = 1000;
  const currentTimestampInSeconds = Math.round(
    Date.now() / milisecondsPerSecond
  );
  const remainingSeconds = token.exp - currentTimestampInSeconds;
  const bufferSecondsBeforeEnd = 240;
  const timeoutInMiliseconds =
    (remainingSeconds - bufferSecondsBeforeEnd) * milisecondsPerSecond;

  return timeoutInMiliseconds;
}

async function renewTokenTiming(currentToken: string): Promise<string> {
  const decodedToken: DecodedToken = jwt_decode(currentToken);
  const timeoutToRefreshToken = calculateTimeToFinishToken(decodedToken);
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      renewSession(currentToken)
        .then((response) => response.json())
        .then((data) => {
          const token: string = data.token;
          localStorage.setItem("token", token);
          resolve(token);
        });
    }, timeoutToRefreshToken);
  });
}

function logOutTiming(currentToken: string, props: LoginType) {
  const decodedToken: DecodedToken = jwt_decode(currentToken);
  const timeToLogout = calculateTimeToFinishToken(decodedToken);
  setTimeout(() => {
    props.setIsLoggedIn(false);
  }, timeToLogout);
}

export default Login;
