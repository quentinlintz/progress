import { Button, Container, Flex, Stack, Text } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import ErrorMessage from "~/components/ErrorMessage";
import Header from "~/components/Header";
import VideoPostCard from "~/components/VideoPostCard";
import { PostContext } from "~/contexts/PostContext";
import { getUserById, requireUserId } from "~/models/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    return json({ error: "User not found." });
  }

  if (user?.streamSources.length === 0) {
    return json({ error: "You haven't linked a stream source yet." });
  }

  const streamSource = user.streamSources[0];

  const clientId = process.env.TWITCH_CLIENT_ID as string;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN as string;

  const videos = await fetch(
    `https://api.twitch.tv/helix/videos?user_id=${streamSource.streamId}&first=1&sort=time&type=archive`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => res.data);

  if (videos.length === 0) {
    return json({ error: "You have no videos to post." });
  }

  return json({ ok: true, user, videos });
};

export default function Post() {
  const { user, videos, error } = useLoaderData();
  const [remainingVideos, setRemainingVideos] = useState(user.remainingVideos);
  const [selectedVideos, setSelectedVideos] = useState(
    user.videos.filter((v: any) => v === videos.id)
  );

  useEffect(() => {
    console.log(selectedVideos);
  }, [selectedVideos]);

  return (
    <>
      <Header />
      <Flex alignItems={"center"} pl={4} pr={4}>
        <Text flex="1" fontWeight={"600"} fontSize={["xl", "2xl"]}>
          {remainingVideos} posts remaining
        </Text>
        <Button colorScheme="cyan" size="lg">
          Save
        </Button>
      </Flex>
      <Stack spacing={"4"} alignItems={"center"} pr={4} pl={4}>
        <Container>
          <Text
            fontWeight={"300"}
            fontSize={"md"}
            textAlign={"center"}
            pb="4"
            pt="4"
          >
            Select which videos you want to post and add tags of the
            languages/frameworks you're using. They'll appear on the 'Videos'
            page with extra details like the video thumbnail and description.
          </Text>
          <PostContext.Provider
            value={{
              selectedVideos,
              setSelectedVideos,
              remainingVideos,
              setRemainingVideos,
            }}
          >
            <Stack spacing="5">
              {videos.map((video: any) => {
                return (
                  <VideoPostCard
                    key={video.id}
                    video={video}
                    isSelected={selectedVideos.forEach((v: any) => {
                      if (v.id === video.id) return true;
                    })}
                  />
                );
              })}
            </Stack>
          </PostContext.Provider>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </Container>
      </Stack>
    </>
  );
}
