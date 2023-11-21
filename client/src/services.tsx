import { PORT } from "./config/config";

export function prepareURL() {
  const ip = localStorage.getItem("ip");
  return `http://${ip}:${PORT}`;
}

export interface FormData {
  password: string;
}

export interface RegistrationData {
  nickName: string | null;
  email: string;
  password: string;
}

export async function login(data: FormData) {
  const URL = prepareURL();
  const response = await fetch(`${URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response;
}

export const renewSession = async (token: string | null): Promise<Response> => {
  const URL = prepareURL();

  const response = await fetch(`${URL}/renew`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};
/*
export async function getMeasurement(meterId: string, token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}/meters/run/${meterId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}
*/
export async function getSensors(token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}/sensors`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function getSwitches(token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}/switches`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function getTasksWhereDeviceId(
  deviceId: string,
  token: string | null
) {
  const URL = prepareURL();

  const response = await fetch(`${URL}/tasks/device/${deviceId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function deleteTask(taskId: string, token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function deleteDevice(taskId: string, token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}/devices/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const createSensor = async (sensor: object, token: string | null) => {
  const URL = prepareURL();
console.log('sensor in function', sensor)
  const response = await fetch(`${URL}/devices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sensor),
  });
  return response;
};

export const createSwitch = async (
  switchDevice: object,
  token: string | null
) => {
  const URL = prepareURL();

  const response = await fetch(`${URL}/devices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(switchDevice),
  });
  return response;
};

export const createTask = async (task: object, token: string | null) => {
  const URL = prepareURL();

  const response = await fetch(`${URL}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
  return response;
};

export const runDevice = async (
  DeviceId: string,
  onStatus: boolean,
  token: string | null
) => {
  const URL = prepareURL();
  console.log(onStatus);
  const response = await fetch(`${URL}/devices/run/${DeviceId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      onStatus: onStatus,
    }),
  });
  return response;
};
