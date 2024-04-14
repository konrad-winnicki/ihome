import { ServerMessages } from "../../ServerMessages";
import { FileRepositoryHelpers } from "../../Infrastructure/file/auxilaryFunctions";
import { FileDeviceRepository } from "../../Infrastructure/file/FileDeviceRepository";

export function prepareFileDeviceRepositoryWithMockPerameters(
  helper: FileRepositoryHelpers
) {
  const serverMessages = new ServerMessages();
  const fileDeviceRepository = new FileDeviceRepository(helper, serverMessages);

  return fileDeviceRepository;
}
