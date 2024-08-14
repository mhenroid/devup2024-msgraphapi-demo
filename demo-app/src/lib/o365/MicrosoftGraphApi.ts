import {
  Client,
  ClientOptions,
  AuthenticationProvider,
  PageCollection,
  PageIterator,
  PageIteratorCallback,
  ResponseType,
} from "@microsoft/microsoft-graph-client";

export class AccessTokenAuthProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  getAccessToken(authenticationProviderOptions: any): Promise<string> {
    return Promise.resolve(this.accessToken);
  }
}

export type MicrosoftGraphApiResponse = {
  success: boolean;
  err?: any;
  data?: any;
  status?: number;
  msg?: string;
};

export class MicrosoftGraphApi {
  private authProvider: AuthenticationProvider;

  constructor(authProvider: AuthenticationProvider) {
    if (!authProvider) {
      throw new Error("Missing authProvider parameter");
    }
    this.authProvider = authProvider;
  }

  private getClient(): Client {
    let clientOptions: ClientOptions = {
      authProvider: this.authProvider,
    };
    const client = Client.initWithMiddleware(clientOptions);
    return client;
  }

  public async getJson(url: string): Promise<any> {
    let client = this.getClient();
    let response = await client.api(url).responseType(ResponseType.RAW).get();
    if (response.status == 401) {
      let result = await response.json();
      throw new Error("Unauthorized", { cause: result });
    }
    if (response.ok) {
      return await response.json();
    }
    return null;
  }

  public async get(url: string): Promise<Response> {
    let client = this.getClient();
    let response = await client.api(url).responseType(ResponseType.RAW).get();
    if (response.status == 401) {
      let result = await response.json();
      throw new Error("Unauthorized", { cause: result });
    }
    return response;
  }

  public async post(url: string, content: any): Promise<Response> {
    let client = this.getClient();
    let response = await client
      .api(url)
      .responseType(ResponseType.RAW)
      .post(content);

    if (response.status == 401) {
      let result = await response.json();
      throw new Error("Unauthorized", { cause: result });
    }
    return response;
  }

  public async delete(url: string): Promise<Response> {
    let client = this.getClient();
    let response = await client
      .api(url)
      .responseType(ResponseType.RAW)
      .delete();

    if (response.status == 401) {
      let result = await response.json();
      throw new Error("Unauthorized", { cause: result });
    }
    return response;
  }

  public async patch(url: string, content: any): Promise<Response> {
    let client = this.getClient();
    let response = await client
      .api(url)
      .responseType(ResponseType.RAW)
      .patch(content);
    if (response.status == 401) {
      let result = await response.json();
      throw new Error("Unauthorized", { cause: result });
    }
    return response;
  }

  public async getPagedData(url: string, maxItems?: number): Promise<any[]> {
    let client = this.getClient();
    let response = await this.getJson(url);

    let maxCountValue = maxItems || -1;
    let count = 0;
    let allItems: any[] = [];
    let callback: PageIteratorCallback = (data) => {
      allItems.push(data);
      count++;
      if (count === maxCountValue) {
        return false;
      }
      return true;
    };

    let pageIterator = new PageIterator(client, response, callback);
    await pageIterator.iterate();

    return allItems;
  }
}
