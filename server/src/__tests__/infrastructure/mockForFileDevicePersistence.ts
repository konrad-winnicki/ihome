import { ServerMessages } from "../../ServerMessages";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import { FileDeviceRepository } from "../../Infrastructure/filePersistencia/FileDeviceRepository";


export function prepareFileDeviceRepositoryWithMockPerameters(
  helper: FileRepositoryHelpers
) {
  const serverMessages = new ServerMessages();
  const fileDeviceRepository = new FileDeviceRepository(
    helper,
    serverMessages
  );

  return fileDeviceRepository;
}




