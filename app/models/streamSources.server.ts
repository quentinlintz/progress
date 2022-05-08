import { prisma } from "../utils/prisma";

import type {
  users as User,
  stream_sources as StreamSource,
  stream_types as StreamType,
} from "@prisma/client";

export type { stream_sources as StreamSource } from "@prisma/client";

export async function getStreamSourcesByUser(
  userId: string
): Promise<Array<StreamSource>> {
  return prisma.stream_sources.findMany({
    where: { userId: userId },
  });
}

export function addStreamSource({
  userId,
  url,
  streamType,
}: {
  userId: User["id"];
  url: string;
  streamType: StreamType;
}) {
  return prisma.stream_sources.create({
    data: {
      url,
      streamType,
      user: { connect: { id: userId } },
    },
  });
}
