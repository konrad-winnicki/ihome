import { PORT } from "./config/config";

export interface FormData {
  email: string;
  password: string;
}

export interface RegistrationData {
  nickName: string | null;
  email: string;
  password: string;
}

export async function fetchLogin(data: FormData) {
  const response = await fetch(`http://localhost:${PORT}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response;
}

export const fetchRegistration = async (data: RegistrationData | null) => {
  const response = await fetch(`http://localhost:${PORT}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response;
};



export const createChatRoom = async (
  token: string | null,
  userId: string | null,
  chatName: string
) => {
  const data = { chatName: chatName, ownerId: userId };
  const response = await fetch(`http://localhost:${PORT}/api/chatrooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  return response;
};



export const fetchChatRoomList = async (token: string | null) => {
	const response = await fetch(`http://localhost:${PORT}/api/chatrooms`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return response;
}
