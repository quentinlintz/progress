import { useContext, useState } from "react";
import {
  Box,
  Checkbox,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { PostContext } from "~/contexts/PostContext";
import type { Video } from "~/models/videos.server";

type Props = {
  video: Video;
  isSelected: boolean;
};

const VideoPostCard = ({ video, isSelected }: Props) => {
  const [isChecked, setIsChecked] = useState(isSelected);
  const {
    selectedVideos,
    setSelectedVideos,
    remainingVideos,
    setRemainingVideos,
  }: any = useContext(PostContext);
  let date = new Date(video.createdAt);
  const readableDate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  const handleChecked = (e: any) => {
    if (!e.target.checked) {
      setSelectedVideos(selectedVideos.filter((v: Video) => v.id !== video.id));
      setRemainingVideos(remainingVideos + 1);
      setIsChecked(e.target.checked);
    } else if (remainingVideos > 0) {
      setSelectedVideos([...selectedVideos, video]);
      setRemainingVideos(remainingVideos - 1);
      setIsChecked(e.target.checked);
    }
  };

  return (
    <Box
      boxShadow={"lg"}
      rounded={"lg"}
      p={4}
      border="2px"
      borderColor={isChecked ? "cyan.500" : "blackAlpha.50"}
      bgGradient={useColorModeValue(
        "linear(to-br, gray.100, gray.200)",
        "linear(to-br, gray.700, gray.800)"
      )}
    >
      <Checkbox
        isChecked={isChecked}
        onChange={(e) => handleChecked(e)}
        spacing="1rem"
        colorScheme={"cyan"}
      >
        <Stack direction="column" maxW={[250, 500]}>
          <Text fontWeight={"600"} isTruncated>
            {video.title}
          </Text>
          <Text fontWeight={"300"}>Created on: {readableDate}</Text>
        </Stack>
      </Checkbox>
      {/* {isChecked ? (
        <Input mt={4} flex="1" placeholder="comma separated tags, max: 10" />
      ) : null} */}
    </Box>
  );
};

export default VideoPostCard;
