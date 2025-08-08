import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — SwiftCart",
  description: "Sign in to your SwiftCart account.",
  robots: { index: false },
};

export default function SignInPage() {
  return <SignIn />;
}
