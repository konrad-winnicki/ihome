import request from "supertest";
import { ScheduleTime } from "../../../domain/Task";

export async function addTask(
  requestUri: string,
  token: string,
  deviceId: string,
  onStatus: boolean,
  scheduledTime: ScheduleTime,
) {
  const response = await request(requestUri)
    .post("/tasks")
    .set("Authorization", token)
    .send({
      deviceId: deviceId,
      onStatus:onStatus,
     scheduledTime:scheduledTime
    });
  return response.body.taskId;
}
