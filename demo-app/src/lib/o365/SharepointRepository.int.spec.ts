/*
 * @group integration
 */
import {
  EnvVariableAuthProvider,
  MicrosoftGraphApi,
} from "./MicrosoftGraphApi";
import { SharepointRepository } from "./SharepointRepository";
const TEST_FOLDER_NAME = "_TEST_FOLDER";

describe("Microsoft Graph API", () => {
  let sharepoint: SharepointRepository;

  beforeEach(() => {
    let graphApi = new MicrosoftGraphApi(
      new EnvVariableAuthProvider("TEST_MICROSOFT_ACCESS_TOKEN")
    );
    sharepoint = new SharepointRepository(graphApi);
  });

  it("Can get site by name", async () => {
    let name = "EmployeeResumes";
    let result = await sharepoint.getSiteBySiteName(name);
    expect(result).not.toBeNull();
    if (result != null) {
      expect(result.id).toBe(
        "daughertybussolutions.sharepoint.com,be7e5228-9665-45d3-aabb-fb73c7730dd8,1407b666-ff83-4cd4-bed6-2bd416382a9f"
      );
      expect(result.displayName).toBe("Employee Resumes");
    }
  });

  it("Can get site by name - invalid", async () => {
    let name = "NoSuchThing";
    let result = await sharepoint.getSiteBySiteName(name);
    expect(result).toBeNull();
  });

  it("Can get list by name", async () => {
    let siteName = "EmployeeResumes";
    let listName = "Documents";
    let result = await sharepoint.getSiteList(siteName, listName);
    expect(result).not.toBeNull();
    if (result != null) {
      expect(result.name).toBe("Shared Documents");
      expect(result.displayName).toBe("Documents");
    }
  });

  it("Can get list - invalid", async () => {
    let list1 = await sharepoint.getSiteList("InvalidSite", "InvalidList");
    expect(list1).toBeNull();

    let list2 = await sharepoint.getSiteList("EmployeeResumes", "InvalidList");
    expect(list2).toBeNull();
  });

  it("Can get site list items", async () => {
    let siteName = "EmployeeResumes";
    let listName = "Documents";
    let maxCount = 10;
    let items = await sharepoint.getAllSiteListItems(
      siteName,
      listName,
      maxCount
    );
    expect(items!.length).toBe(10);
    for (let item of items!) {
      expect(item.id).toBeDefined();
      expect(item.fields).toBeDefined();
    }
  });

  it("Can get site list drive", async () => {
    let siteName = "EmployeeResumes";
    let driveName = "Documents";
    let drive = await sharepoint.getSiteListDrive(siteName, driveName);
    expect(drive).not.toBeNull();
    if (drive != null) {
      expect(drive.id).toBeDefined();
      expect(drive.name).toBe("Documents");
    }
  });

  it("Can get site list item and children", async () => {
    let siteName = "EmployeeResumes";
    let listName = "Documents";
    let folderName = "Vincent, Jayson";

    let result = await sharepoint.getSiteListItem(
      siteName,
      listName,
      folderName
    );

    expect(result).not.toBeNull();
    expect(result!.fields.FileLeafRef).toBe(folderName);
  });

  it("Can get site list item", async () => {
    let siteName = "EmployeeResumes";
    let listName = "Documents";
    let folderName = "Vincent, Jayson";

    let result = await sharepoint.getSiteListItem(
      siteName,
      listName,
      folderName
    );

    expect(result).not.toBeNull();
    expect(result!.fields).toBeDefined();
    expect(result?.fields.FileLeafRef).toBeDefined();
  });

  it("Can get site list item and children", async () => {
    let siteName = "EmployeeResumes";
    let listName = "Documents";
    let folderName = "Vincent, Jayson";

    let results = await sharepoint.getSiteListItemAndChildren(
      siteName,
      listName,
      folderName
    );

    expect(results!.length >= 2).toBeTruthy();
    expect(results![0].fields.FileLeafRef).toBe(folderName);
    for (let result of results!) {
      expect(result.fields).toBeDefined();
    }
  });

  it("Can create site list folder", async () => {
    let siteName = "EmployeeResumes";
    let listName = "Archive Documents";

    try {
      let existingFolder = await sharepoint.getSiteListItem(
        siteName,
        listName,
        TEST_FOLDER_NAME
      );
      expect(existingFolder).toBeNull();
      let newFolder = await sharepoint.createSiteListItemFolder(
        siteName,
        listName,
        TEST_FOLDER_NAME
      );
      expect(newFolder).not.toBeNull();

      let createdFolder = await sharepoint.getSiteListItem(
        siteName,
        listName,
        TEST_FOLDER_NAME
      );
      expect(createdFolder).not.toBeNull();
    } finally {
      await sharepoint.deleteSiteListItemFolder(
        siteName,
        listName,
        TEST_FOLDER_NAME
      );
    }
  });

  it("Can create site list folder", async () => {
    let siteName = "EmployeeResumes";
    let listName = "Archive Documents";
    let archiveFolder = "_ARCHIVE";

    try {
      let arFolder = await sharepoint.createSiteListItemFolder(
        siteName,
        listName,
        archiveFolder
      );
      expect(arFolder).not.toBeNull();

      let newFolder = await sharepoint.createSiteListItemFolder(
        siteName,
        listName,
        TEST_FOLDER_NAME
      );
      expect(newFolder).not.toBeNull();

      let createdFolder = await sharepoint.getSiteListItem(
        siteName,
        listName,
        TEST_FOLDER_NAME
      );
      expect(createdFolder).not.toBeNull();

      await sharepoint.moveSiteListFolder(
        siteName,
        listName,
        TEST_FOLDER_NAME,
        archiveFolder
      );
    } finally {
      await sharepoint.deleteSiteListItemFolder(
        siteName,
        listName,
        TEST_FOLDER_NAME
      );
      await sharepoint.deleteSiteListItemFolder(
        siteName,
        listName,
        archiveFolder
      );
    }
  });
});
