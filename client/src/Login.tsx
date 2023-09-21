import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLogin } from "./services";
import jwt_decode from "jwt-decode";
import GoogleButton from 'react-google-button'
import { REDIRECT_URI, CLIENT_ID} from "./config/config";


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

  const getGoogleOauth = () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth?";
    const options = {
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}${qs.toString()}`;
  };

  const googleLogin = () => {
    const uri = getGoogleOauth();
    window.location.href = uri

  };

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
      const response = await fetchLogin(formData);
      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        const decodedToken: DecodedToken = jwt_decode(token);
        localStorage.setItem("token", token);
        localStorage.setItem("nickName", decodedToken.nickName);
        localStorage.setItem("id", decodedToken.userId);
        console.log("login successful");
        navigate("/api/chatroom", {state: true})
      } else {
        alert("Email and/or password incorrect");
        console.error("login failed");
      }
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
            email
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="email"
            name="email"
            value={formData.email}
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
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          type="submit"
        >
          Log In
        </button>
        <button
          className="w-full mt-4 bg-blue-500 text-white py-2 px-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          onClick={navigateRegistration}
        >
          Registration
        </button>
        
      
        <div  className="flex items-center mt-4 justify-center">      <GoogleButton onClick={googleLogin}></GoogleButton>
</div>
      </form>
      
      
    </div>
  );
};

export default Login;
