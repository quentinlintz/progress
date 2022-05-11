import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";

const ErrorMessage = ({ children }: any) => {
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

export default ErrorMessage;
