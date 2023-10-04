import { PORT } from "./config/config";
import { URL } from "./config/config";

export interface FormData {
  email: string;
  password: string;
}

export interface RegistrationData {
  nickName: string | null;
  email: string;
  password: string;
}

export async function getMeasurement(meterId: string) {
  const response = await fetch(`${URL}:${PORT}/meters/run/${meterId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function getMeters() {
  const response = await fetch(`${URL}:${PORT}/meters`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function getSwitches() {
  const response = await fetch(`${URL}:${PORT}/switches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function getTasksWhereDeviceId(deviceId:string) {
  const response = await fetch(`${URL}:${PORT}/tasks/device/${deviceId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}


export async function deleteTask(taskId:string) {
  const response = await fetch(`${URL}:${PORT}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;}

export const createMeter = async (meter: object) => {
  const response = await fetch(`${URL}:${PORT}/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meter),
  });
  return response;
};

export const createSwitch = async (switchDevice: object) => {
  const response = await fetch(`${URL}:${PORT}/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(switchDevice),
  });
  return response;
};

export const createTask = async (task: object) => {
  const response = await fetch(`${URL}:${PORT}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
  return response;
};

export const toggleSwitch = async (switchDeviceId: string, switchStatus: boolean) => {
  const response = await fetch(`${URL}:${PORT}/switches/run/${switchDeviceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({switchOn: switchStatus }),
  });
  return response;
};

export const fetchChatRoomList = async (token: string | null) => {
  const response = await fetch(`http://localhost:${PORT}/api/chatrooms`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
};
