import prisma from "../utils/prisma";
import { omit, map } from "lodash";

import type { users as User, videos as Video } from "@prisma/client";

export type { videos as Video } from "@prisma/client";
export { stream_types as StreamType } from "@prisma/client";

export type TwitchVideo = {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: string[];
};

export async function getVideos() {
  return prisma.videos.findMany({
    orderBy: { createdAt: "desc" },
    include: { likes: true, tags: true },
    take: 32,
  });
}

export async function removeVideosByUser(userId: User["id"]) {
  return await prisma.videos.deleteMany({ where: { userId: userId } });
}

export async function addVideos({ videos }: { videos: Array<Video> }) {
  const videosRemovedIds = map(videos, (v) => omit(v, ["id"]));
  return await prisma.videos.createMany({
    data: videosRemovedIds,
    skipDuplicates: true,
  });
}
