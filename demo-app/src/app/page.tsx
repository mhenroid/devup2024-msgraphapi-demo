import { auth, signIn } from "@/auth/auth";
import { Box, Button } from "@mui/material";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    return redirect("/user");
  }

  return (
    <>
      <Button variant="contained" href="/api/auth/signin">
        Login
      </Button>
    </>
  );
}
