import { Button } from "@mui/material";
import Link from "next/link";

export type NavLinkItem = {
  title: string;
  path: string;
  key: string;
};

export default function NavLink({ item }: { item: NavLinkItem }) {
  return (
    <Button
      component={Link}
      key={item.key}
      sx={{ color: "#fff" }}
      href={item.path}
    >
      {item.title}
    </Button>
  );
}
