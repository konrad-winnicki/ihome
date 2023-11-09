import { ServerMessages } from "../../ServerMessages";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import { FileTaskRepository } from "../../Infrastructure/filePersistencia/FileTaskRepository";


export function prepareFileTaskRepositoryWithMockPerameters(
  helper: FileRepositoryHelpers
) {
  const serverMessages = new ServerMessages();
  const fileTaskRepository = new FileTaskRepository(
    helper,
    serverMessages
  );

  return fileTaskRepository;
}




