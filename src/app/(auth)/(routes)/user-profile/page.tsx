import React from "react";
import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile — SwiftCart",
  description: "Manage your account settings and preferences.",
  robots: { index: false },
};

const UserProfilePage = () => {
  return <UserProfile routing="hash" />;
};

export default UserProfilePage;
