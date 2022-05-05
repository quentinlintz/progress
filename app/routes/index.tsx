import Header from "~/components/Header";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return <Header />;
}
