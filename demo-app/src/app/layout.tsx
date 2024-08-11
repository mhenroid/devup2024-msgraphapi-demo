import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.scss";
import { ThemeProvider } from "../theme/ThemeProvider";
import { SessionProvider as NextSessionProvider } from "next-auth/react";
import { Container } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@/components/navBar/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "",
  description: "",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextSessionProvider>
          <ThemeProvider>
            <div>
              <CssBaseline />
              <AppBar />
              <main>
                <Container maxWidth={false}>{children}</Container>
              </main>
            </div>
          </ThemeProvider>
        </NextSessionProvider>
      </body>
    </html>
  );
}
