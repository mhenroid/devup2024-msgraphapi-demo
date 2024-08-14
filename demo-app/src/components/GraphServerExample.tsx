import { useSession } from "next-auth/react";
import {
  AccessTokenAuthProvider,
  MicrosoftGraphApi,
} from "@/lib/o365/MicrosoftGraphApi";
import { getAuthSession } from "@/auth/auth";

export default async function GraphServerExample() {
  // Get the access token from session state
  let session = await getAuthSession();
  let accessToken = session.access_token;

  // Initialize our wrapper class
  let graphApi = new MicrosoftGraphApi(
    new AccessTokenAuthProvider(accessToken)
  );

  // Simple example
  let result = await graphApi.getJson("https://graph.microsoft.com/v1.0/me");

  // Demonstrate paged results
  // When using the $top=2, only 2 results are shown per page
  // The getPagedData will get data from more and more pages until it meets the requested count or end of data
  // let result = await graphApi.getPagedData(
  //   "https://graph.microsoft.com/v1.0/users?$top=2",
  //   10
  // );

  return (
    <>
      <h1>Graph API call from server</h1>
      <pre>{JSON.stringify(result, undefined, 2)}</pre>
    </>
  );
}
