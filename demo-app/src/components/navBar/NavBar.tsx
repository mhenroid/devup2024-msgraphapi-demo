import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import LoginButton from "./LoginButton";
import Box from "@mui/material/Box";
import NavLink, { NavLinkItem } from "./navLink/NavLink";
import { getAuthSession } from "@/auth/auth";

const navItems: NavLinkItem[] = [{ title: "Home", path: "/", key: "home" }];

export default async function AppBarComponent() {
  let session = await getAuthSession();

  return (
    <AppBar position="static" className="appBar">
      <Toolbar variant="regular">
        <Typography variant="h6" noWrap>
          DevUp 2024 Graph API demo app
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {session?.user && (
          <Box>
            {navItems.map((item) => (
              <NavLink key={item.key} item={item}></NavLink>
            ))}
          </Box>
        )}

        <span>
          <LoginButton></LoginButton>
        </span>
      </Toolbar>
    </AppBar>
  );
}
