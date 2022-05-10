import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import Header from "~/components/Header";
import {
  Button,
  Container,
  Flex,
  Input,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSupabase } from "~/utils/supabase-client";
import { getUserById, getUserId, requireUserId } from "~/models/user.server";
import type { Video } from "~/models/videos.server";
import { StreamType } from "~/models/videos.server";
import type { StreamSource } from "~/models/streamSources.server";
import { removeStreamSource } from "~/models/streamSources.server";
import { addStreamSource } from "~/models/streamSources.server";
import { IconBrandTwitch } from "@tabler/icons";
import invariant from "tiny-invariant";
import { ErrorMessage } from "~/components/ErrorMessage";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const login = formData.get("login");
  const action = formData.get("action");

  const clientId = process.env.TWITCH_CLIENT_ID as string;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN as string;

  switch (action) {
    case "link": {
      invariant(typeof login === "string", "Username must be a string");

      // Check if this user exists
      const data = await fetch(
        `https://api.twitch.tv/helix/users?login=${login}`,
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

      // Return an error if the Twitch user isn't found
      const errors = {
        userName: data.length !== 0 ? null : "Twitch user not found!",
      };
      const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
      );
      if (hasErrors) {
        return json(errors);
      }

      const userId = await getUserId(request);
      const user = data[0];
      const streamSourceData = {
        userId,
        name: user.display_name,
        description: user.description,
        thumbnail: user.profile_image_url,
        streamType: StreamType.TWITCH,
      };

      // TODO check for errors
      await addStreamSource(streamSourceData);

      return json({ ok: true });
    }

    case "unlink": {
      const userId = await getUserId(request);

      const streamSourceData = {
        userId,
        streamType: StreamType.TWITCH,
      };

      await removeStreamSource(streamSourceData);
    }
  }

  return json({ ok: true });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  return json({ ok: true, user });
};

export default function Profile() {
  const errors = useActionData();
  const { user } = useLoaderData();
  const transition = useTransition();
  const submit = useSubmit();
  const supabase = useSupabase();

  let transitionState =
    transition.state === "submitting" || transition.state === "loading";

  const videos = user.videos;
  const streamSources = user.streamSources;

  const twitchSource =
    streamSources.find((source: StreamSource) => {
      const streamType = source.streamType;
      return streamType === "TWITCH";
    }) ?? null;

  const handleSignOut = () => {
    supabase.auth.signOut().then(() => {
      submit(null, { method: "post", action: "/signout" });
    });
  };

  return (
    <>
      <Header />
      <Container maxW="xl" p={8}>
        <Stack spacing={"8"}>
          <Flex>
            <Text fontWeight={"600"} fontSize={"xl"}>
              Account:
            </Text>
            <Spacer />
            <Text fontWeight={"200"} fontSize={"xl"} isTruncated>
              {user.email}
            </Text>
          </Flex>
          <Flex>
            <Text fontWeight={"600"} fontSize={"xl"}>
              Posts remaining:
            </Text>
            <Spacer />
            <Text fontWeight={"200"} fontSize={"xl"} isTruncated>
              {user.remainingVideos}
            </Text>
          </Flex>
          <Form method="post">
            <Flex>
              <Input
                flex="4"
                borderRightRadius="0"
                placeholder={
                  twitchSource ? twitchSource.name : "Your Twitch username"
                }
                name="login"
                disabled={twitchSource}
              />
              {twitchSource ? (
                <Button
                  flex="1"
                  borderLeftRadius="0"
                  leftIcon={<IconBrandTwitch />}
                  bgColor="#9146FF"
                  color="white"
                  type="submit"
                  name="action"
                  value="unlink"
                  disabled={transitionState}
                  isLoading={transitionState}
                >
                  Unlink
                </Button>
              ) : (
                <Button
                  flex="1"
                  borderLeftRadius="0"
                  leftIcon={<IconBrandTwitch />}
                  bgColor="#9146FF"
                  color="white"
                  type="submit"
                  name="action"
                  value="link"
                  disabled={transitionState}
                  isLoading={transitionState}
                >
                  Link
                </Button>
              )}
            </Flex>
            <ErrorMessage>
              {errors?.userName ? errors.userName : null}
            </ErrorMessage>
          </Form>
          <Button onClick={handleSignOut}>Sign out</Button>
        </Stack>
      </Container>
      <Stack spacing={"4"} alignItems={"center"}>
        <Spacer />
        <Text fontWeight={"600"} fontSize={"xl"}>
          Videos
        </Text>
        {videos.length !== 0 ? (
          videos.map((video: Video) => video.title)
        ) : (
          <>
            <Text fontWeight={"200"} fontSize={"xl"} isTruncated>
              You haven't posted anything yet
            </Text>
            <Button size="md" colorScheme={"teal"}>
              <Link to="/post">Post now</Link>
            </Button>
          </>
        )}
      </Stack>
    </>
  );
}
