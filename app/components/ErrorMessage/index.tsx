import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";

export const ErrorMessage = ({ children }: any) => {
  return (
    <>
      {children ? (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{children}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
};
