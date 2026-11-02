import { respond } from "@/lib/server";
export const runtime = "nodejs";
export const POST = (request: Request) => respond(request, false);
