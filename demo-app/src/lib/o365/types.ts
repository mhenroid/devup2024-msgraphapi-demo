import { DocumentFolder, Document } from "../types";

export interface SPSite {
  id?: string;
  name?: string;
  webUrl?: string;
  displayName?: string;
}

export interface SPList {
  id?: string;
  webUrl?: string;
  name?: string;
  displayName?: string;
}

export interface SPListItem {
  contentType: {
    id: string;
    name: string;
  };
  createdDateTime: string;
  eTag: string;
  fields: any;
  id: string;

  lastModifiedDateTime: string;
  parentReference: {
    id: string;
    siteId: string;
  };
  webUrl: string;
}

export interface SPListItemFolder extends DocumentFolder {
  eTag: string;
  parentReferenceId: string;
}

export interface SPListItemDocument extends Document {
  eTag: string;
  parentReferenceId: string;
}

export interface Drive {
  id: string;
  name: string;
  webUrl: string;
  driveType: string;
}

export interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
}
