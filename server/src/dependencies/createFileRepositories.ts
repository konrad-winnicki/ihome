import { ServerMessages } from "../ServerMessages";
import { FileDeviceRepository } from "../Infrastructure/file/FileDeviceRepository";
import { FileRepositoryHelpers } from "../Infrastructure/file/auxilaryFunctions";
import { FileTaskRepository } from "../Infrastructure/file/FileTaskRepository";

export function createFileRepositories() {
  const serverMessages = ServerMessages.getInstance();
  const fileHelperMethods = new FileRepositoryHelpers();
  const deviceRepository = new FileDeviceRepository(
    fileHelperMethods,
    serverMessages
  );

  const taskRepository = new FileTaskRepository(
    fileHelperMethods,
    serverMessages
  );
  return { deviceRepository, taskRepository };
}
