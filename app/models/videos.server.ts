import { prisma } from "../utils/prisma";

import type { users as User, videos as Video } from "@prisma/client";

export async function getVideos() {
  return prisma.videos.findMany({
    orderBy: { createdAt: "desc" },
    include: { likes: true, tags: true },
    take: 16,
  });
}

export async function getVideosByUser(userId: string): Promise<Array<Video>> {
  return prisma.videos.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    include: { likes: true, tags: true },
  });
}

export function addVideo({
  userId,
  url,
  thumbnail,
  title,
  description,
  tags,
}: {
  userId: User["id"];
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  tags: string[];
}) {
  return prisma.videos.create({
    data: {
      url,
      thumbnail,
      title,
      description,
      user: { connect: { id: userId } },
      tags: {
        connectOrCreate: tags.map((tag) => {
          return {
            where: { name: tag },
            create: { name: tag },
          };
        }),
      },
      likes: {},
    },
  });
}
