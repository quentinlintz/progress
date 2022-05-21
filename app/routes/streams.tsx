import { Center, SimpleGrid, Text } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import Header from "~/components/Header";
import StreamCard from "~/components/StreamCard";
import type { StreamSource } from "~/models/streamSources.server";
import { getStreamSources } from "~/models/streamSources.server";

export const loader: LoaderFunction = async ({ request }) => {
  const streams = await getStreamSources();

  return json({ ok: true, streams });
};

export default function Streams() {
  const { streams } = useLoaderData();

  return (
    <>
      <Header />
      {streams.length !== 0 ? (
        <SimpleGrid columns={[1, 1, 2, 2, 4]} spacing={8} p={8}>
          {streams.map((stream: StreamSource) => {
            const { login, displayName, description, thumbnail, streamType } =
              stream;
            return (
              <StreamCard
                key={login}
                login={login}
                displayName={displayName}
                description={description}
                thumbnail={thumbnail}
                streamType={streamType}
              />
            );
          })}
        </SimpleGrid>
      ) : (
        <Center>
          <Text fontSize="2xl">There are no streams, yet!</Text>
        </Center>
      )}
    </>
  );
}
