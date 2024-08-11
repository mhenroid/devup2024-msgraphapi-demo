"use client";
import { useSession } from "next-auth/react";
import { Button } from "@mui/material";

export default function AccessToken() {
  const { data: session, status } = useSession();

  const copyTokenToClipboard = () => {
    // @ts-ignore
    navigator.clipboard.writeText(session?.access_token);
  };

  // @ts-ignore
  if (session?.access_token) {
    return (
      <>
        <h2>Your access token</h2>
        {/* @ts-ignore */}
        <div>{session?.access_token}</div>
        <Button variant="contained" onClick={copyTokenToClipboard}>
          Copy
        </Button>
      </>
    );
  }

  return <></>;
}
