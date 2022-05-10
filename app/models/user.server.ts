import type { users as User } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { getSession } from "~/utils/supabase.server";
import prisma from "../utils/prisma";

export type { users as User } from "@prisma/client";

const USER_SESSION_KEY = "userId";

export async function getUserById(id: User["id"]) {
  return prisma.users.findUnique({
    where: { id },
    include: { videos: true, streamSources: true },
  });
}

export async function getUserByEmail(email?: User["email"]) {
  if (email === undefined) return null;
  return prisma.users.findUnique({ where: { email } });
}

export async function updateRemainingVideos(
  id: User["id"],
  remainingVideos: User["remainingVideos"]
) {
  return prisma.users.update({
    where: { id },
    data: { remainingVideos },
  });
}

export async function getUserId(request: Request) {
  let session = await getSession(request.headers.get("Cookie"));
  const userId = session.get(USER_SESSION_KEY);

  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await signOut(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/signin?${searchParams}`);
  }

  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  if (userId == undefined) return null;

  const profile = await getUserById(userId);
  if (profile) return profile;

  throw await signOut(request);
}

export async function signOut(request: Request) {
  let session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
