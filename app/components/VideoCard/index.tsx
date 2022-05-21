import {
  Box,
  Stack,
  Text,
  Image,
  useColorModeValue,
  Spacer,
} from "@chakra-ui/react";
import type { Video } from "~/models/videos.server";

type Props = {
  video: Video;
  isChecked: boolean;
};

const VideoCard = ({ video, isChecked }: Props) => {
  let date = new Date(video.createdAt);
  const readableDate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  const thumbnailUrl = video.thumbnail
    .replace("%{width}", "320")
    .replace("%{height}", "180");

  return (
    <Box
      boxShadow={"lg"}
      rounded={"lg"}
      border="2px"
      borderColor={isChecked ? "cyan.500" : "blackAlpha.50"}
      bgGradient={useColorModeValue(
        "linear(to-br, gray.100, gray.200)",
        "linear(to-br, gray.700, gray.800)"
      )}
    >
      <Stack direction="column" spacing="2" h="100%">
        <Image
          flex="1"
          src={thumbnailUrl}
          alt={video.title}
          borderTopRadius="lg"
        />
        <Box pr="4" pl="4">
          <Text fontWeight="600" fontSize={"xl"} noOfLines={2}>
            {video.title}
          </Text>
          <Text fontWeight="300" fontSize="xs">
            Created at: {readableDate}
          </Text>
        </Box>
        <Box pr="4" pl="4" pb="2">
          <Text fontWeight="500" fontSize="sm" noOfLines={3}>
            {video.description}
          </Text>
        </Box>
        <Spacer />
      </Stack>
    </Box>
  );
};

export default VideoCard;
