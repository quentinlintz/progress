import type { TwitchVideo, Video } from "~/models/videos.server";

export const convertTwitchVideos = ({
  twitchVideos,
  userId,
}: {
  twitchVideos: Array<TwitchVideo>;
  userId: string;
}): Array<Video> => {
  let videoArray = Array<Video>();

  twitchVideos.forEach((video: TwitchVideo) => {
    const v = video as TwitchVideo;
    const newVideo: Video = {
      id: "",
      url: v.url,
      thumbnail: v.thumbnail_url,
      title: v.title,
      description: v.description,
      videoId: v.id,
      createdAt: new Date(v.published_at),
      userId: userId,
    };
    videoArray.push(newVideo);
  });

  return videoArray;
};
