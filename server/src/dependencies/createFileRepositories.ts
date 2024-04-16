import { ServerMessages } from "../infrastructure/ServerMessages";
import { FileDeviceRepository } from "../infrastructure/file/FileDeviceRepository";
import { FileRepositoryHelpers } from "../infrastructure/file/auxilaryFunctions";
import { FileTaskRepository } from "../infrastructure/file/FileTaskRepository";

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
