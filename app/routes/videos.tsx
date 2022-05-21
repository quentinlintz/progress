import { Center, SimpleGrid, Text } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import Header from "~/components/Header";
import VideoCardLink from "~/components/VideoCardLink";
import type { Video } from "~/models/videos.server";
import { getVideos } from "~/models/videos.server";

export const loader: LoaderFunction = async ({ request }) => {
  const videos = await getVideos();

  return json({ ok: true, videos });
};

export default function Videos() {
  const { videos } = useLoaderData();

  return (
    <>
      <Header />
      {videos.length !== 0 ? (
        <SimpleGrid columns={[1, 1, 2, 2, 3]} spacing={8} p={8}>
          {videos.map((video: Video) => {
            return <VideoCardLink key={video.id} video={video} />;
          })}
        </SimpleGrid>
      ) : (
        <Center>
          <Text fontSize="2xl">There are no videos, yet!</Text>
        </Center>
      )}
    </>
  );
}
