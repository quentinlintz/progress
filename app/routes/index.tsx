import { useOptionalUser } from "~/utils";
import { Button } from "@chakra-ui/react";

export default function Index() {
  const user = useOptionalUser();
  return <Button colorScheme="blue">Button</Button>;
}
