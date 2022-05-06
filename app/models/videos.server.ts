import { prisma } from "../utils/prisma";

import type { User, Video } from "@prisma/client";

export async function getVideos() {
  return prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    include: { likes: true, tags: true },
    take: 16,
  });
}

export async function getVideosByUser(userId: string): Promise<Array<Video>> {
  return prisma.video.findMany({
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
  return prisma.video.create({
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
