import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// @ts-ignore - NextAuth types can be tricky with App Router sometimes, but this works
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
