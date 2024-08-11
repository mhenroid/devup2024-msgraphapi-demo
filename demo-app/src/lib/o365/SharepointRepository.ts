import { MicrosoftGraphApi } from "./MicrosoftGraphApi";
import { Drive, DriveItem, SPList, SPListItem, SPSite } from "./types";

export class SharepointRepository {
  private graphApi: MicrosoftGraphApi;
  private driveIds: Map<string, string>;

  constructor(graphApi: MicrosoftGraphApi) {
    if (!graphApi) {
      throw new Error("Missing graphApi parameter");
    }
    this.graphApi = graphApi;
    this.driveIds = new Map<string, string>();
  }

  /**
   * Returns a SharePoint site
   * @param siteName
   * @returns
   */
  public async getSiteBySiteName(siteName: string): Promise<SPSite | null> {
    let url = `/sites/root:/sites/${siteName}:/`;
    return this.graphApi.getJson(url);
  }

  /**
   * Returns a SharePoint list name
   * @param siteName
   * @param listName
   * @returns
   */
  public async getSiteList(
    siteName: string,
    listName: string
  ): Promise<SPList | null> {
    let url = `/sites/root:/sites/${siteName}:/lists/${listName}`;
    return this.graphApi.getJson(url);
  }

  /**
   * Returns all items in the  site list recursively (i.e. all folders and documents recursively)
   * @param siteName
   * @param listName
   * @param maxItems
   * @returns
   */
  public async getAllSiteListItems(
    siteName: string,
    listName: string,
    maxItems?: number
  ): Promise<SPListItem[]> {
    let url = `/sites/root:/sites/${siteName}:/lists/${listName}/items?expand=fields`;
    return await this.graphApi.getPagedData(url, maxItems);
  }

  /**
   * Returns the OneDrive drive for a particular SharePoint list
   * @param siteName
   * @param listName
   * @returns
   */
  public async getSiteListDrive(
    siteName: string,
    listName: string
  ): Promise<Drive | null> {
    let url = `/sites/root:/sites/${siteName}:/lists/${listName}/drive`;
    return await this.graphApi.getJson(url);
  }

  /**
   * Returns the OneDrive drive Id for a particular SharePoint list.
   * This call is cached so it can be called multiple times without penalty
   * @param siteName
   * @param listName
   * @returns
   */
  private async getSiteListDriveId(
    siteName: string,
    listName: string
  ): Promise<string | null> {
    let cacheKey = `${siteName}/${listName}`;
    let cachedValue = this.driveIds.get(cacheKey) || null;
    if (cachedValue) {
      return cachedValue;
    }

    let drive = await this.getSiteListDrive(siteName, listName);
    if (!drive) {
      return null;
    }

    this.driveIds.set(cacheKey, drive.id);
    return drive.id;
  }

  private async getSiteListDriveItem(
    siteName: string,
    listName: string,
    path: string
  ): Promise<DriveItem | null> {
    let driveId = await this.getSiteListDriveId(siteName, listName);
    if (!driveId) {
      throw `Cannot find drive for site=${siteName} list=${listName}`;
    }

    let driveItemUrl = `/drives/${driveId}/root:/${path}:/`;
    let driveItemResult = await this.graphApi.getJson(driveItemUrl);

    return driveItemResult;
  }

  /**
   * Returns a site list item
   * @param siteName
   * @param listName
   * @param path
   * @returns
   */
  public async getSiteListItem(
    siteName: string,
    listName: string,
    path: string
  ): Promise<SPListItem | null> {
    let driveId = await this.getSiteListDriveId(siteName, listName);
    if (!driveId) {
      throw `Cannot find drive for site=${siteName} list=${listName}`;
    }

    let driveItemUrl = `/drives/${driveId}/root:/${path}:/?$expand=listItem`;
    let result = await this.graphApi.getJson(driveItemUrl);
    if (result) {
      return result.listItem;
    }
    return null;
  }

  /**
   * Returns an array of items which include the folder and its immediate children
   * @param siteName
   * @param listName
   * @param folderName
   * @returns
   */
  public async getSiteListItemAndChildren(
    siteName: string,
    listName: string,
    path: string
  ): Promise<SPListItem[] | null> {
    let driveId = await this.getSiteListDriveId(siteName, listName);
    if (!driveId) {
      throw `Cannot find drive for site=${siteName} list=${listName}`;
    }

    let driveItemUrl = `/drives/${driveId}/root:/${path}:/?$expand=listItem`;
    let driveItemResult = await this.graphApi.getJson(driveItemUrl);

    let childItemUrl = `/drives/${driveId}/root:/${path}:/children?$expand=listItem`;
    let childItemsResult = await this.graphApi.getPagedData(childItemUrl);

    let childListItems = childItemsResult.map((i) => i.listItem);
    return [driveItemResult.listItem, ...childListItems];
  }

  /**
   * Creates a root folder in a SharePoint list
   * @param siteName
   * @param listName
   * @param folderName
   * @returns
   */
  public async createSiteListItemFolder(
    siteName: string,
    listName: string,
    folderName: string
  ): Promise<SPListItem | null> {
    let driveId = await this.getSiteListDriveId(siteName, listName);
    if (!driveId) {
      throw `Cannot find drive for site=${siteName} list=${listName}`;
    }

    // Create the root folder
    let url = `/drives/${driveId}/root/children`;
    let content = {
      name: folderName,
      folder: {},
    };

    await this.graphApi.post(url, content);

    return this.getSiteListItem(siteName, listName, folderName);
  }

  /**
   * Moves a SharePoint folder to the recycle bin
   * @param siteName
   * @param listName
   * @param folderName
   * @returns
   */
  public async deleteSiteListItemFolder(
    siteName: string,
    listName: string,
    folderName: string
  ) {
    let driveId = await this.getSiteListDriveId(siteName, listName);
    if (!driveId) {
      throw `Cannot find drive for site=${siteName} list=${listName}`;
    }

    let driveItem = await this.getSiteListDriveItem(
      siteName,
      listName,
      folderName
    );
    if (!driveItem) {
      return null;
    }

    let url = `/drives/${driveId}/items/${driveItem.id}`;
    await this.graphApi.delete(url);
  }

  /**
   * Moves a SharePoint folder to a new destination folder in the same list
   * @param siteName
   * @param listName
   * @param folderName
   * @param destinationFolderName
   * @returns
   */
  public async moveSiteListFolder(
    siteName: string,
    listName: string,
    folderName: string,
    destinationFolderName: string
  ): Promise<void> {
    // Get the drive of the site list
    let driveId = await this.getSiteListDriveId(siteName, listName);
    if (!driveId) {
      throw `Cannot find drive for site=${siteName} list=${listName}`;
    }

    // Get the folder we are moving
    let fromFolder = await this.getSiteListDriveItem(
      siteName,
      listName,
      folderName
    );
    if (!fromFolder) {
      return;
    }

    // Get the folder where we will move to
    let toFolder = await this.getSiteListDriveItem(
      siteName,
      listName,
      destinationFolderName
    );
    if (!toFolder) {
      return;
    }

    // Move the folder
    let moveUrl = `/drives/${driveId}/items/${fromFolder.id}`;
    let content = {
      parentReference: {
        id: toFolder.id,
      },
      name: folderName,
    };

    await this.graphApi.patch(moveUrl, content);
  }
}
