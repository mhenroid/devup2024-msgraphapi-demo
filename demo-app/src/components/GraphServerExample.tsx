import { useSession } from "next-auth/react";
import {
  AccessTokenAuthProvider,
  MicrosoftGraphApi,
} from "@/lib/o365/MicrosoftGraphApi";
import { getAuthSession } from "@/auth/auth";

export default async function GraphServerExample() {
  let session = await getAuthSession();
  let accessToken = session.access_token;
  let graphApi = new MicrosoftGraphApi(
    new AccessTokenAuthProvider(accessToken)
  );
  let result = await graphApi.getJson("https://graph.microsoft.com/v1.0/me");
  // let result = await graphApi.getJson(
  //   "https://graph.microsoft.com/v1.0/me/drive/items/01FSSII2HXBI7XWNIYTZCKHN6MID6L2NLW/workbook/worksheets/Sheet1/range/cell(row=0,column=0)"
  // );

  return (
    <>
      <h1>Graph API call from server</h1>
      <pre>{JSON.stringify(result, undefined, 2)}</pre>
    </>
  );
}
