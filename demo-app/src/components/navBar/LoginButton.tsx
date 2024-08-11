import { Box, Button } from "@mui/material";
import { getAuthSession } from "@/auth/auth";

type LoginLogoutButtonProps = {
  text: string;
  href: string;
};

const LoginLogoutButton = ({ text, href }: LoginLogoutButtonProps) => {
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        sx={{ width: 90 }}
        href={href}
      >
        {text}
      </Button>
    </>
  );
};

export default async function LoginButton() {
  let session = await getAuthSession();

  if (session?.user) {
    return <LoginLogoutButton text="Logout" href="/api/auth/signout" />;
  }

  return <LoginLogoutButton text="Login" href="/api/auth/signin" />;
}
