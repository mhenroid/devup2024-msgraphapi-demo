import { getFileType } from "@/util/fileTypes";
import { getDateFromFileName } from "@/util/dateParser";
import { Document, DocumentFolder, EmployeeFolder } from "../types";
import { SPListItem, SPListItemDocument, SPListItemFolder } from "./types";
import { SharepointRepository } from "./SharepointRepository";
export const EMPLOYEE_RESUME_SITE_NAME = "EmployeeResumes";
export const EMPLOYEE_RESUME_DOCUMENTS_LIST_NAME = "Documents";
export const EMPLOYEE_ARCHIVE_FOLDER_NAME = "_ARCHIVE";

export class DocumentRepository {
  private sharepointRepository: SharepointRepository;

  /**
   * Creates the SPDocumentRepository object
   * @param sharePointRepository
   */
  constructor(sharePointRepository: SharepointRepository) {
    if (!sharePointRepository) {
      throw new Error("Missing sharePointRepository parameter");
    }
    this.sharepointRepository = sharePointRepository;
  }

  /**
   * Returns an employee folder and child documents
   * @param folderName
   * @returns
   */
  public async getDocumentFolder(
    folderName: string
  ): Promise<DocumentFolder | null> {
    let listItems = await this.sharepointRepository.getSiteListItemAndChildren(
      EMPLOYEE_RESUME_SITE_NAME,
      EMPLOYEE_RESUME_DOCUMENTS_LIST_NAME,
      folderName
    );
    if (listItems == null) {
      return null;
    }

    // Get the documents
    let mappedResults = mapListItemsToFolders(listItems);
    if (!mappedResults || mappedResults.length == 0) {
      return null;
    }
    return mappedResults[0];
  }

  /**
   * Returns all Employee folders in the emmployee resume site
   * @returns
   */
  async getAllDocumentFolders(maxItems?: number): Promise<DocumentFolder[]> {
    let listItems = await this.sharepointRepository.getAllSiteListItems(
      EMPLOYEE_RESUME_SITE_NAME,
      EMPLOYEE_RESUME_DOCUMENTS_LIST_NAME,
      maxItems
    );
    if (!listItems) {
      return [];
    }

    let mappedResults = mapListItemsToFolders(listItems);
    return mappedResults;
  }

  /**
   * Creates a new employee folder
   * @param folderName
   * @returns
   */
  async createDocumentFolder(
    folderName: string
  ): Promise<DocumentFolder | null> {
    await this.sharepointRepository.createSiteListItemFolder(
      EMPLOYEE_RESUME_SITE_NAME,
      EMPLOYEE_RESUME_DOCUMENTS_LIST_NAME,
      folderName
    );

    return this.getDocumentFolder(folderName);
  }

  /**
   * Do not use this!  It is used for internal testing purposes
   * @param folderName
   * @returns
   */
  async dangerousDeleteDocumentFolder(folderName: string) {
    return await this.sharepointRepository.deleteSiteListItemFolder(
      EMPLOYEE_RESUME_SITE_NAME,
      EMPLOYEE_RESUME_DOCUMENTS_LIST_NAME,
      folderName
    );
  }

  /**
   * Moves an employee folder to the _ARCHIVE folder
   * @param folderName
   * @returns
   */
  async archiveDocumentFolder(folderName: string) {
    let result = await this.sharepointRepository.moveSiteListFolder(
      EMPLOYEE_RESUME_SITE_NAME,
      EMPLOYEE_RESUME_DOCUMENTS_LIST_NAME,
      folderName,
      EMPLOYEE_ARCHIVE_FOLDER_NAME
    );
    return result;
  }
}

/**
 * Helper function to read a list of raw SharePoint list items and maps them to folders and documents
 * @param items
 * @returns
 */
const mapListItemsToFolders = (items: SPListItem[]): SPListItemFolder[] => {
  let rawFolders = items.filter((o) => o.contentType.name == "Folder");
  let rawDocuments = items.filter((o) => o.contentType.name == "Document");

  let rootFolders: SPListItemFolder[] = [];

  let regexp = /EmployeeResumes\/Shared%20Documents\/.+?\/.+/;
  for (let rawFolder of rawFolders) {
    // skip child folders
    let isChildFolder = regexp.test(rawFolder.webUrl);
    if (isChildFolder) {
      continue;
    }

    // Create the List item folder
    let folder: SPListItemFolder = {
      id: rawFolder.id,
      parentReferenceId: rawFolder.parentReference.id,
      folderName: rawFolder.fields.FileLeafRef,
      createdDateTime: rawFolder.createdDateTime,
      eTag: rawFolder.eTag,
      lastModifiedDateTime: rawFolder.lastModifiedDateTime,
      webUrl: rawFolder.webUrl,
      documents: [] as any[],
    };
    rootFolders.push(folder);
  }

  // Parse through all the documents
  for (let rawDocument of rawDocuments) {
    let parentReferenceId = rawDocument.parentReference.id;

    // Create a list item document
    let document: SPListItemDocument = {
      id: rawDocument.id,
      webUrl: rawDocument.webUrl,
      eTag: rawDocument.eTag,
      createdDateTime: rawDocument.createdDateTime,
      lastModifiedDateTime: rawDocument.lastModifiedDateTime,
      parentReferenceId: rawDocument.parentReference.id,
      fileName: rawDocument.fields.FileLeafRef,
      // fileSize: rawDocument.fields.FileSizeDisplay,
      docType: getFileType(rawDocument.fields.FileLeafRef),
      docDate: getDateFromFileName(rawDocument.fields.FileLeafRef) ?? "",
    };

    // Find the folder the item is in
    let parentFolder = rootFolders.find((o) =>
      o.eTag.includes(parentReferenceId)
    );

    // We only care about documents that are children of a root folder
    if (parentFolder != null) {
      if (parentFolder.documents == undefined) {
        parentFolder.documents = [];
      }
      parentFolder.documents.push(document);
    }
  }

  return rootFolders;
};
