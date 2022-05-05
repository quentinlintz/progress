import { useOptionalUser } from "~/utils";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import Header from "~/components/Header";

export const loader: LoaderFunction = async ({ request }) => {
  return json({ ok: true });
};

export default function Streams() {
  const user = useOptionalUser();

  return <Header />;
}
