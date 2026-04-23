import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brisbane Local Dashboard",
  description:
    "Weather, events, and transport information for Brisbane, Australia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body className="min-h-screen antialiased">
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
