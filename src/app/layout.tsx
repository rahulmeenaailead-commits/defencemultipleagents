import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DCR — Defense Contract Reviewer",
  description:
    "Upload a defense contract PDF. See risky clauses with severity, plain-language actions, and a proof panel showing the quoted span + cited reg + verifier badges.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
