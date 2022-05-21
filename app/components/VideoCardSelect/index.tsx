import { useContext, useState } from "react";
import { Checkbox } from "@chakra-ui/react";
import { PostContext } from "~/contexts/PostContext";
import type { Video } from "~/models/videos.server";
import VideoCard from "../VideoCard";

type Props = {
  video: Video;
  isSelected: boolean;
};

const VideoCardSelect = ({ video, isSelected }: Props) => {
  const [isChecked, setIsChecked] = useState(isSelected);
  const {
    selectedVideos,
    setSelectedVideos,
    remainingVideos,
    setRemainingVideos,
  }: any = useContext(PostContext);

  const handleChecked = (e: any) => {
    if (!e.target.checked) {
      setSelectedVideos(
        selectedVideos.filter((v: Video) => v.videoId !== video.videoId)
      );
      setRemainingVideos(remainingVideos + 1);
      setIsChecked(e.target.checked);
    } else if (remainingVideos > 0) {
      setSelectedVideos([...selectedVideos, video]);
      setRemainingVideos(remainingVideos - 1);
      setIsChecked(e.target.checked);
    }
  };

  return (
    <Checkbox
      style={{ display: "flex" }}
      isChecked={isChecked}
      onChange={(e: any) => handleChecked(e)}
      spacing="1rem"
      size="lg"
      colorScheme={"cyan"}
    >
      <VideoCard video={video} isChecked={isChecked} />
    </Checkbox>
  );
};

export default VideoCardSelect;
