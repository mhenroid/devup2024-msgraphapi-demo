/*
 * @group integration
 */
import {
  MicrosoftGraphApi,
  EnvVariableAuthProvider,
} from "./MicrosoftGraphApi";

describe("Microsoft Graph API", () => {
  let graphApi: MicrosoftGraphApi;

  beforeEach(() => {
    graphApi = new MicrosoftGraphApi(
      new EnvVariableAuthProvider("TEST_MICROSOFT_ACCESS_TOKEN")
    );
  });

  it("Throws when expired access token", async () => {
    let graphApi = new MicrosoftGraphApi(
      new EnvVariableAuthProvider("TEST_EXPIRED_MICROSOFT_ACCESS_TOKEN")
    );

    await expect(graphApi.get("/me")).rejects.toThrow("Unauthorized");
  });

  it("Invalid call returns null", async () => {
    let result = await graphApi.getJson("/noSuchThing");
    expect(result).toBeNull();
  });

  it("Can get raw data by url", async () => {
    let response = await graphApi.get("/me");
    let json = await response.json();
    expect(response.ok).toBeTruthy();
    expect(json.id).toBeDefined();
    expect(json.displayName).toBeDefined();
    expect(json.givenName).toBeDefined();
    expect(json.surname).toBeDefined();
  });

  it("Can get data by url", async () => {
    let response = await graphApi.getJson("/me");
    expect(response.id).toBeDefined();
    expect(response.displayName).toBeDefined();
    expect(response.givenName).toBeDefined();
    expect(response.surname).toBeDefined();
  });

  it("Can get paged content", async () => {
    // Get top 5 users 2 times
    let response = await graphApi.getPagedData("/users?$top=5", 10);
    expect(response.length).toBe(10);
  });
});
