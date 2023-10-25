export class ServerMessages {
  public compensation = {
    SUCCESS: "Compensation succeded",
    FAILURE: "Compensation failed",
  };

  public addDevice = {
    SUCCESS: "deviceId",
    FAILURE: "Device not added",
  };

  public deleteDevice = {
    SUCCESS: "Device deleted",
    FAILURE: "Device not deleted",
  };

  public addTask = {
    SUCCESS: "taskId",
    FAILURE: "Task not added",
  };

  public deleteTask = {
    SUCCESS: "Task deleted",
    FAILURE: "Task not deleted",
  };

public mongoServerError = {
  NAME_DUPLICATION: "Unique violation error: NameConflictError"
}

}