/*
 * @group integration
 */
import {
  EnvVariableAuthProvider,
  MicrosoftGraphApi,
} from "./MicrosoftGraphApi";
import { DocumentRepository } from "./DocumentRepository";
import { SharepointRepository } from "./SharepointRepository";

const TEST_FOLDER_NAME = "_TEST_FOLDER";

describe("Microsoft Graph API", () => {
  let docLib: DocumentRepository;

  beforeEach(() => {
    let graphApi = new MicrosoftGraphApi(
      new EnvVariableAuthProvider("TEST_MICROSOFT_ACCESS_TOKEN")
    );
    let sharepointRepository = new SharepointRepository(graphApi);

    docLib = new DocumentRepository(sharepointRepository);
  });

  it("Can get employee folder", async () => {
    let employeeName = "Vincent, Jayson";
    let folder = await docLib.getDocumentFolder(employeeName);
    expect(folder).toBeDefined();
    expect(folder?.folderName).toBe(employeeName);
  });

  // WARNING: THIS CAN BE A REALLY LONG RUNNING TEST
  it("Can map all folders and documents", async () => {
    let folders = await docLib.getAllDocumentFolders();
    expect(folders.length > 1000).toBe(true);
  });

  it("Can create folder", async () => {
    try {
      let newFolder = await docLib.createDocumentFolder(TEST_FOLDER_NAME);
      expect(newFolder).not.toBeNull();

      let createdFolder = await docLib.getDocumentFolder(TEST_FOLDER_NAME);
      expect(createdFolder).not.toBeNull();
      expect(createdFolder?.folderName).toBe(TEST_FOLDER_NAME);
    } finally {
      await docLib.dangerousDeleteDocumentFolder(TEST_FOLDER_NAME);
    }
  });
});
