import React, { useState } from "react";
import { createChatRoom } from "./services";

export type CreateChtRoomProps = {
  setCreateChatRoomInProgress: (param: boolean) => void;
  setRefreshChatPanel: (param: boolean) => void;
  setNewRoom: (param: boolean) => void;
};

export const CreateChatRoom: React.FC<CreateChtRoomProps> = (props) => {
  const [inputField, setInputValue] = useState("");
  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("id");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await createChatRoom(token, user_id, inputField);
      if (response.ok) {
        if (response.ok) {
          alert("Room created");
          props.setNewRoom(true);
        } else {
          alert("Room name already in use");
        }
      }
    } catch (error) {
      console.error("an error occurred:", error);
    }
    props.setCreateChatRoomInProgress(false);
  };

  return (
    <div className=" w-full p-6 bg-white rounded-lg shadow-lg">
      <form className="form" onSubmit={handleSubmit}>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="email"
        >
          Introduce new name
        </label>
        <input
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          type="text"
          id="newName"
          onChange={(e) => handleInputChange(e)}
          required
        />

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

export default CreateChatRoom;
