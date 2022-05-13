import {
  Box,
  Link,
  Stack,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

type Props = {
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  isSelected: boolean;
};

const VideoDisplayCard = ({
  url,
  thumbnail,
  title,
  description,
  isSelected,
}: Props) => {
  const thumbnailUrl = thumbnail
    .replace("%{width}", "350")
    .replace("%{height}", "180");

  return (
    <Box
      boxShadow={"2xl"}
      rounded={"lg"}
      border={isSelected ? "2px" : "0px"}
      borderColor={isSelected ? "cyan" : "black"}
      bgGradient={useColorModeValue(
        "linear(to-br, gray.100, gray.200)",
        "linear(to-br, gray.700, gray.800)"
      )}
      minH={60}
    >
      <Stack direction="column" spacing="0">
        <Image flex="1" src={thumbnailUrl} alt={title} borderTopRadius="lg" />
        <Box p={4}>
          <Text fontWeight={"600"} fontSize={"xl"} noOfLines={2}>
            {title}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default VideoDisplayCard;
