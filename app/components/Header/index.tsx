import { Link } from "@remix-run/react";
import {
  Box,
  Flex,
  Button,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  HStack,
} from "@chakra-ui/react";
import {
  IconMoonStars,
  IconMenu2,
  IconPlus,
  IconSun,
  IconX,
  IconUser,
} from "@tabler/icons";

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={useColorModeValue("teal.100", "teal.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Button
            size={"md"}
            display={{ md: "none" }}
            aria-label={"Open Menu"}
            onClick={isOpen ? onClose : onOpen}
          >
            {isOpen ? <IconX /> : <IconMenu2 />}
          </Button>
          <HStack spacing={8} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              <Link to="/post">
                <Button
                  variant={"solid"}
                  size={"sm"}
                  colorScheme={"teal"}
                  leftIcon={<IconPlus />}
                >
                  Post
                </Button>
              </Link>
              <Link to="/videos">
                <Button size="sm">Videos</Button>
              </Link>
              <Link to="/streams">
                <Button size="sm">Streams</Button>
              </Link>
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={4}>
              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <IconMoonStars /> : <IconSun />}
              </Button>
              <Link to="/profile">
                <Button>
                  <IconUser />
                </Button>
              </Link>
            </Stack>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              <Link to="/post">Post</Link>
              <Link to="/videos">Videos</Link>
              <Link to="/streams">Streams</Link>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
