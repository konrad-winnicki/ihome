import { ServerMessages } from "../../ServerMessages";
import { FileRepositoryHelpers } from "../../infrastructure/file/auxilaryFunctions";
import { FileTaskRepository } from "../../infrastructure/file/FileTaskRepository";

export function prepareFileTaskRepositoryWithMockPerameters(
  helper: FileRepositoryHelpers
) {
  const serverMessages = new ServerMessages();
  const fileTaskRepository = new FileTaskRepository(helper, serverMessages);

  return fileTaskRepository;
}
