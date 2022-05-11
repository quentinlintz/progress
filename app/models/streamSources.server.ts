import prisma from "../utils/prisma";

import type { users as User, stream_types as StreamType } from "@prisma/client";

export type { stream_sources as StreamSource } from "@prisma/client";

export async function getStreamSources() {
  return prisma.stream_sources.findMany({
    take: 16,
  });
}

export function addStreamSource({
  login,
  displayName,
  description,
  thumbnail,
  streamType,
  streamId,
  userId,
}: {
  login: string;
  displayName: string;
  description: string;
  thumbnail: string;
  streamType: StreamType;
  streamId: string;
  userId: User["id"];
}) {
  return prisma.stream_sources.create({
    data: {
      login,
      displayName,
      description,
      thumbnail,
      streamType,
      streamId,
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
