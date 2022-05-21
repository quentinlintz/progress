import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import Header from "~/components/Header";
import {
  Button,
  Checkbox,
  Container,
  Flex,
  Input,
  Link,
  Spacer,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSupabase } from "~/utils/supabase-client";
import {
  getUserById,
  getUserId,
  requireUserId,
  updateReceiveUpdates,
  updateRemainingVideos,
} from "~/models/user.server";
import { removeVideosByUser } from "~/models/videos.server";
import { StreamType } from "~/models/videos.server";
import type { StreamSource } from "~/models/streamSources.server";
import { removeStreamSource } from "~/models/streamSources.server";
import { addStreamSource } from "~/models/streamSources.server";
import { IconBrandDiscord, IconBrandTwitch } from "@tabler/icons";
import invariant from "tiny-invariant";
import ErrorMessage from "~/components/ErrorMessage";
import { useState } from "react";

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const login = String(formData.get("login"));
  const updates = String(formData.get("updates")) === "true";
  const action = formData.get("action");

  const clientId = process.env.TWITCH_CLIENT_ID as string;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN as string;

  // Return an error if the Twitch user isn't found
  const errors = {
    userName: login?.length !== 0 ? null : "A username must be entered",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

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
        userName: data.length !== 0 ? null : "Twitch user not found",
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
        login: user.login,
        displayName: user.display_name,
        description: user.description,
        thumbnail: user.profile_image_url,
        streamType: StreamType.TWITCH,
        streamId: user.id,
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

      // When adding new stream sources, make sure to remove only videos of a certain stream source
      await removeVideosByUser(userId);
      await updateRemainingVideos(userId, 4);

      return json({ ok: true });
    }

    case "save": {
      await updateReceiveUpdates(userId, updates);

      return json({ ok: true });
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
  const [updates, setUpdates] = useState<boolean>(user.updates);
  const transition = useTransition();
  const toast = useToast();
  const submit = useSubmit();
  const supabase = useSupabase();

  let submittingState = transition.state === "submitting";

  const streamSources = user.streamSources;

  const twitchSource =
    streamSources.find((source: StreamSource) => {
      const streamType = source.streamType;
      return streamType === "TWITCH";
    }) ?? null;

  const handleSave = () => {
    const formData = new FormData();

    formData.append("updates", String(updates));
    formData.append("action", "save");

    submit(formData, { method: "post", action: "/profile" });

    toast({
      title: "Save successful.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSignOut = () => {
    supabase.auth.signOut().then(() => {
      submit(null, { method: "post", action: "/signout" });
    });
  };

  return (
    <>
      <Header />
      <Flex alignItems={"center"} pl={4} pr={4}>
        <Text flex="1" fontWeight={"600"} fontSize={["xl", "2xl"]}></Text>
        <Button
          colorScheme="cyan"
          size="lg"
          name="action"
          value="save"
          onClick={handleSave}
          disabled={submittingState}
          isLoading={submittingState}
        >
          Save
        </Button>
      </Flex>
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
          <Flex>
            <Text fontWeight={"600"} fontSize={"xl"}>
              Email updates:
            </Text>
            <Spacer />
            <Checkbox
              isChecked={updates}
              onChange={(e: any) => setUpdates(e.target.checked)}
            />
          </Flex>
          <Form method="post">
            <Flex>
              <Input
                flex="3"
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
                  disabled={submittingState}
                  isLoading={submittingState}
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
                  disabled={submittingState}
                  isLoading={submittingState}
                >
                  Link
                </Button>
              )}
            </Flex>
            <ErrorMessage>
              {errors?.userName ? errors.userName : null}
            </ErrorMessage>
          </Form>
          <Link
            style={{ textDecoration: "none" }}
            href="https://discord.gg/EQ8dvBN8Dq"
          >
            <Button w="100%" leftIcon={<IconBrandDiscord />} bgColor="#7289da">
              Join the Discord!
            </Button>
          </Link>
          <Button onClick={handleSignOut}>Sign out</Button>
        </Stack>
      </Container>
    </>
  );
}
