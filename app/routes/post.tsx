import { Container, Stack, Text } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import ErrorMessage from "~/components/ErrorMessage";
import Header from "~/components/Header";
import { getUserById, requireUserId } from "~/models/user.server";
import { useUser } from "~/utils/user";

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

  return json({ ok: true, videos });
};

export default function Post() {
  const user = useUser();
  const loader = useLoaderData();
  const [remainingVideos, setRemainingVideos] = useState(user.remainingVideos);

  return (
    <>
      <Header />
      <Container maxW="xl" alignItems={"center"}>
        <Stack spacing={"4"} alignItems={"center"}>
          <Text fontWeight={"600"} fontSize={"xl"}>
            {remainingVideos} posts remaining
          </Text>
          <Text fontWeight={"300"} fontSize={"md"} textAlign={"center"}>
            Select which videos you want to post and add tags of the
            languages/frameworks you're using.
          </Text>
          {loader.videos.map((video: any) => (
            <div key={video.title}>{video.title}</div>
          ))}
          {loader.error ? <ErrorMessage>{loader.error}</ErrorMessage> : null}
        </Stack>
      </Container>
    </>
  );
}
