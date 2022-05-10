import { prisma } from "../utils/prisma";

import type { users as User, stream_types as StreamType } from "@prisma/client";

export type { stream_sources as StreamSource } from "@prisma/client";

export function addStreamSource({
  name,
  description,
  thumbnail,
  streamType,
  userId,
}: {
  name: string;
  description: string;
  thumbnail: string;
  streamType: StreamType;
  userId: User["id"];
}) {
  return prisma.stream_sources.create({
    data: {
      name,
      description,
      thumbnail,
      streamType,
      user: { connect: { id: userId } },
    },
  });
}

export function removeStreamSource({
  streamType,
  userId,
}: {
  streamType: StreamType;
  userId: User["id"];
}) {
  return prisma.stream_sources.deleteMany({
    where: {
      AND: [
        {
          streamType,
        },
        {
          userId,
        },
      ],
    },
  });
}
