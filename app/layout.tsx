import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parent Education · Staff Workspace",
  description: "Manage cases, classes, test questions, and court certificate delivery.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
