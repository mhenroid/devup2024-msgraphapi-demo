"use client";
import { useSession } from "next-auth/react";

export default function WelcomeMessage() {
  const { data: session, status } = useSession();

  if (session?.user) {
    return (
      <>
        Welcome: {session?.user.name} ({session?.user.email})
      </>
    );
  }
  return <></>;
}
