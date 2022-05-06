import { supabase } from "../utils/supabase.server";
import { prisma } from "../utils/prisma";

import type { User } from "@prisma/client";

export async function createUser(email: string, password: string) {
  const { user } = await supabase.auth.signUp({
    email,
    password,
  });

  const profile = await getUserByEmail(user?.email);

  console.log(profile);

  if (profile === undefined) {
    return prisma.user.create({
      data: {
        email,
      },
    });
  }

  return profile;
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email?: User["email"]) {
  if (email === undefined) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function updateRemainingVideos(
  id: User["id"],
  remainingVideos: User["remainingVideos"]
) {
  return prisma.user.update({
    where: { id },
    data: { remainingVideos },
  });
}
export async function verifySignIn(email: string, password: string) {
  const { user, error } = await supabase.auth.signIn({
    email,
    password,
  });

  if (error) return undefined;
  const profile = await getUserByEmail(user?.email);

  return profile;
}
