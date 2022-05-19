import Header from "~/components/Header";
import {
  List,
  ListIcon,
  ListItem,
  Stack,
  StackDivider,
  Text,
  Link,
} from "@chakra-ui/react";
import {
  IconBrandOpenSource,
  IconCloudUpload,
  IconDeviceTv,
  IconFlask,
} from "@tabler/icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export default function Index() {
  return (
    <>
      <Header />
      <Stack alignItems={"center"} p={8}>
        <Text fontSize={["3xl", "4xl", "6xl"]} fontWeight="extrabold">
          The homebase for
        </Text>
        <Text
          fontSize={["3xl", "4xl", "6xl"]}
          fontWeight="extrabold"
          bgGradient="linear(to-l, #9DECF9, #00A3C4)"
          bgClip="text"
        >
          building in public
        </Text>
        <StackDivider />
        <List spacing={5} fontSize="lg">
          <ListItem>
            <ListIcon mb={1} as={IconDeviceTv} color="cyan.500" />
            Watch how real projects are being made
          </ListItem>
          <ListItem>
            <ListIcon mb={1} as={IconFlask} color="cyan.500" />
            Research the right tech stack to use for your project
          </ListItem>
          <ListItem>
            <ListIcon mb={1} as={IconCloudUpload} color="cyan.500" />
            Post your own stream and videos to promote your project
          </ListItem>
          <ListItem>
            <ListIcon mb={1} as={IconBrandOpenSource} color="cyan.500" />
            Free and{" "}
            <Link
              color="cyan.500"
              href="https://github.com/quentinlintz/progress"
              isExternal
            >
              open source <ExternalLinkIcon mx="2px" />
            </Link>
          </ListItem>
        </List>
      </Stack>
    </>
  );
}
