import { ServerMessages } from "../../ServerMessages";
import { FileRepositoryHelpers } from "../../Infrastructure/file/auxilaryFunctions";
import { FileTaskRepository } from "../../Infrastructure/file/FileTaskRepository";

export function prepareFileTaskRepositoryWithMockPerameters(
  helper: FileRepositoryHelpers
) {
  const serverMessages = new ServerMessages();
  const fileTaskRepository = new FileTaskRepository(helper, serverMessages);

  return fileTaskRepository;
}
