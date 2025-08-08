import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — SwiftCart",
  description: "Sign up for a new SwiftCart account.",
  robots: { index: false },
};

export default function SignUpPage() {
  return <SignUp />;
}
