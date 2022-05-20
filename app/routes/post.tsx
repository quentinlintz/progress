import { Button, Container, Flex, Stack, Text } from "@chakra-ui/react";
import { useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import ErrorMessage from "~/components/ErrorMessage";
import Header from "~/components/Header";
import VideoPostCard from "~/components/VideoPostCard";
import { PostContext } from "~/contexts/PostContext";
import {
  getUserById,
  requireUserId,
  updateRemainingVideos,
} from "~/models/user.server";
import { unionBy, some } from "lodash";
import type { Video } from "~/models/videos.server";
import { addVideos, removeVideosByUser } from "~/models/videos.server";
import { convertTwitchVideos } from "~/utils/video";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const selectedVideos = JSON.parse(String(formData.get("selectedVideos")));
  const remainingVideos = Number(formData.get("remainingVideos"));

  // TODO think of an algorithm to optimize this!
  // Drop all current videos
  await removeVideosByUser(userId);
  // Add all selected videos
  await addVideos({ videos: selectedVideos });

  await updateRemainingVideos(userId, remainingVideos);

  return json({ ok: true });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    return json({ loaderError: "User not found." });
  }

  if (user.streamSources.length === 0) {
    return json({
      user,
      videos: [],
      loaderError: "You haven't linked a stream source yet.",
    });
  }

  const streamSource = user.streamSources[0];

  const clientId = process.env.TWITCH_CLIENT_ID as string;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN as string;

  const twitchVideos = await fetch(
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

  if (twitchVideos.length === 0) {
    return json({
      user,
      videos: [],
      loaderError: "You have no videos to post.",
    });
  }

  const videos = convertTwitchVideos({
    twitchVideos,
    userId,
  });

  return json({ ok: true, user, videos });
};

export default function Post() {
  const { user, videos, loaderError } = useLoaderData();
  const submit = useSubmit();
  const transition = useTransition();
  const mergedVideos = unionBy(videos, user.videos, "videoId");
  const [remainingVideos, setRemainingVideos] = useState<Number>(
    user.remainingVideos
  );
  const [selectedVideos, setSelectedVideos] = useState<Array<Video>>(
    user.videos
  );

  let submittingState = transition.state === "submitting";

  const handleSave = () => {
    const formData = new FormData();

    formData.append("selectedVideos", JSON.stringify(selectedVideos));
    formData.append("remainingVideos", remainingVideos.toString());

    submit(formData, { method: "post", action: "/post" });
  };

  return (
    <>
      <Header />
      <Flex alignItems={"center"} pl={4} pr={4}>
        <Text flex="1" fontWeight={"600"} fontSize={["xl", "2xl"]}>
          {remainingVideos} posts remaining
        </Text>
        <Button
          colorScheme="cyan"
          size="lg"
          onClick={handleSave}
          disabled={submittingState}
          isLoading={submittingState}
        >
          Save
        </Button>
      </Flex>
      <Container alignItems={"center"} pr={4} pl={4}>
        <Text fontWeight={"300"} fontSize={"md"} textAlign={"center"} pt="4">
          Select which videos you want to post.
        </Text>
        <Text fontWeight={"300"} fontSize={"sm"} textAlign={"center"} pb="4">
          If your video is updated or removed on Twitch, you'll have to apply
          the changes here, too. This experience will be improved with future
          versions of Progress.
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
            {mergedVideos.map((video: any) => {
              return (
                <VideoPostCard
                  key={video.id}
                  video={video}
                  isSelected={some(selectedVideos, ["videoId", video.videoId])}
                />
              );
            })}
          </Stack>
        </PostContext.Provider>
        {loaderError ? <ErrorMessage>{loaderError}</ErrorMessage> : null}
      </Container>
    </>
  );
}
