// Prefer generated client output; fallback to default @prisma/client for safety
// This helps avoid runtime failures if the custom output is not present in some environments.
import type { PrismaClient as PrismaClientType } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("../../generated/prisma");
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@prisma/client");
  }
})();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

let prismadb: PrismaClientType;

if (process.env.NODE_ENV === "production") {
  prismadb = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prismadb = global.prisma!;
}

export default prismadb;
