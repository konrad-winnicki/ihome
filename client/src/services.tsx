import { PORT } from "./config/config";

function prepareURL() {
  const ip = localStorage.getItem("ip");
  return `http://${ip}`;
}

export interface FormData {
  password: string;
}

export interface RegistrationData {
  nickName: string | null;
  email: string;
  password: string;
}

export async function fetchLogin(data: FormData) {
  const URL = prepareURL();
  const response = await fetch(`${URL}:${PORT}/login`, {
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

  const response = await fetch(`${URL}:${PORT}/renew`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};

export async function getMeasurement(meterId: string, token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}:${PORT}/meters/run/${meterId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function getMeters(token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}:${PORT}/meters`, {
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

  const response = await fetch(`${URL}:${PORT}/switches`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function listRunningSwitches(token: string | null) {
  const URL = prepareURL();

  const response = await fetch(`${URL}:${PORT}/running`, {
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

  const response = await fetch(`${URL}:${PORT}/tasks/device/${deviceId}`, {
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

  const response = await fetch(`${URL}:${PORT}/tasks/${taskId}`, {
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

  const response = await fetch(`${URL}:${PORT}/devices/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const createMeter = async (meter: object, token: string | null) => {
  const URL = prepareURL();

  const response = await fetch(`${URL}:${PORT}/devices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meter),
  });
  return response;
};

export const createSwitch = async (
  switchDevice: object,
  token: string | null
) => {
  const URL = prepareURL();

  const response = await fetch(`${URL}:${PORT}/devices`, {
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

  const response = await fetch(`${URL}:${PORT}/tasks`, {
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

  const response = await fetch(`${URL}:${PORT}/devices/run/${DeviceId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      onStatus }),
  });
  return response;
};
