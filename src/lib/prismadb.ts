import { PrismaClient } from "../../generated/prisma";


declare global {
  var prisma: PrismaClient | undefined;
}

let prismadb: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismadb = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prismadb = global.prisma;
}

export default prismadb;
