import {
  Avatar,
  Box,
  Flex,
  Icon,
  Link,
  Stack,
  StackDivider,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { IconBrandTwitch, IconBrandYoutube } from "@tabler/icons";
import { motion } from "framer-motion";
import type { StreamType } from "~/models/videos.server";

type Props = {
  login: string;
  displayName: string;
  description: string;
  thumbnail: string;
  streamType: StreamType;
};

const StreamCard = ({
  login,
  displayName,
  description,
  thumbnail,
  streamType,
}: Props) => {
  const streamUrl =
    streamType === "TWITCH"
      ? `https://twitch.tv/${login}`
      : `https://youtube.com/${login}`;

  return (
    <motion.div
      whileHover={{
        scale: 1.1,
      }}
    >
      <Link href={streamUrl} style={{ textDecoration: "none" }}>
        <Box
          boxShadow={"2xl"}
          rounded={"lg"}
          p={4}
          bgGradient={useColorModeValue(
            "linear(to-br, gray.100, gray.200)",
            "linear(to-br, gray.700, gray.800)"
          )}
          minH={60}
        >
          <Stack divider={<StackDivider />}>
            <Flex alignItems={"center"} mb={2}>
              <Avatar size="xl" name={displayName} src={thumbnail} />
              <Stack flex="1" spacing={6}>
                <Box alignSelf={"end"}>
                  {streamType === "TWITCH" ? (
                    <Icon as={IconBrandTwitch} color="#9146FF" w={8} h={8} />
                  ) : (
                    <Icon as={IconBrandYoutube} color="#FF0000" w={8} h={8} />
                  )}
                </Box>
                <Box alignSelf={"center"}>
                  <Tag
                    size="lg"
                    variant="solid"
                    colorScheme="cyan"
                    borderRadius="full"
                  >
                    {displayName}
                  </Tag>
                </Box>
              </Stack>
            </Flex>
            <Text
              textAlign={"start"}
              fontWeight={"400"}
              fontSize={["lg", "lg", "sm"]}
              noOfLines={4}
            >
              {description}
            </Text>
          </Stack>
        </Box>
      </Link>
    </motion.div>
  );
};

export default StreamCard;
