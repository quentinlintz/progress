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
import { unionBy, differenceBy, some } from "lodash";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  const formData = await request.formData();
  const selectedVideos = formData.get("selectedVideos");
  const remainingVideos = Number(formData.get("remainingVideos"));

  await updateRemainingVideos(userId, remainingVideos);

  if (!user) {
    return json({ error: "User not found" });
  }

  const currentVideos = user.videos;

  //

  // const videosToRemove =
  // const videosToAdd =

  return json({ ok: true });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    return json({ loaderError: "User not found." });
  }

  if (user?.streamSources.length === 0) {
    return json({ loaderError: "You haven't linked a stream source yet." });
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
    return json({ loaderError: "You have no videos to post." });
  }

  return json({ ok: true, user, videos });
};

export default function Post() {
  const { user, videos, error } = useLoaderData();
  const submit = useSubmit();
  const transition = useTransition();
  const mergedVideos = unionBy(videos, user.videos, "id");
  const [remainingVideos, setRemainingVideos] = useState(user.remainingVideos);
  const [selectedVideos, setSelectedVideos] = useState(user.videos);

  let transitionState =
    transition.state === "submitting" || transition.state === "loading";

  const handleSave = () => {
    const formData = new FormData();

    formData.append("selectedVideos", selectedVideos);
    formData.append("remainingVideos", remainingVideos);

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
          disabled={transitionState}
          isLoading={transitionState}
        >
          Save
        </Button>
      </Flex>
      <Container alignItems={"center"} pr={4} pl={4}>
        <Text
          fontWeight={"300"}
          fontSize={"md"}
          textAlign={"center"}
          pb="4"
          pt="4"
        >
          Select which videos you want to post.
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
                  isSelected={some(selectedVideos, ["id", video.id])}
                />
              );
            })}
          </Stack>
        </PostContext.Provider>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      </Container>
    </>
  );
}
