import { ServerMessages } from "../../ServerMessages";
import { FileRepositoryHelpers } from "../../infrastructure/file/auxilaryFunctions";
import { FileDeviceRepository } from "../../infrastructure/file/FileDeviceRepository";

export function prepareFileDeviceRepositoryWithMockPerameters(
  helper: FileRepositoryHelpers
) {
  const serverMessages = new ServerMessages();
  const fileDeviceRepository = new FileDeviceRepository(helper, serverMessages);

  return fileDeviceRepository;
}
