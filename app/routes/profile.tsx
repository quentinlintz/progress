import { useLoaderData, useSubmit } from "@remix-run/react";
import Header from "~/components/Header";
import {
  Button,
  Container,
  Flex,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSupabase } from "~/utils/supabase-client";
import { getUserById, requireUserId } from "~/models/user.server";
import type { Video } from "~/models/videos.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  return json({ ok: true, user });
};

export default function Profile() {
  const { user } = useLoaderData();
  const videos = user.videos;
  const submit = useSubmit();
  const supabase = useSupabase();

  const handleSignOut = () => {
    supabase.auth.signOut().then(() => {
      submit(null, { method: "post", action: "/signout" });
    });
  };

  return (
    <>
      <Header />
      <Container maxW="2xl" p={8}>
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
          <Button onClick={handleSignOut}>Sign out</Button>
          <Spacer />
          <Stack
            spacing={"4"}
            alignItems={"center"}
            divider={<StackDivider borderColor="teal.700" />}
          >
            <Text fontWeight={"600"} fontSize={"xl"}>
              Videos
            </Text>
            {videos.length !== 0 ? (
              videos.map((video: Video) => video.title)
            ) : (
              <Text fontWeight={"200"} fontSize={"xl"} isTruncated>
                You haven't posted anything yet
              </Text>
            )}
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
