import type { Video } from "~/models/videos.server";
import VideoCard from "../VideoCard";
import { motion } from "framer-motion";
import { Link } from "@chakra-ui/react";

type Props = {
  video: Video;
};

const VideoCardLink = ({ video }: Props) => {
  return (
    <motion.div
      style={{ display: "flex" }}
      whileHover={{
        scale: 1.1,
      }}
    >
      <Link display="flex" href={video.url} style={{ textDecoration: "none" }}>
        <VideoCard video={video} isChecked={false} />
      </Link>
    </motion.div>
  );
};

export default VideoCardLink;
