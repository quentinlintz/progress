import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import Header from "~/components/Header";
import { requireUserId } from "~/models/user.server";
import { useUser } from "~/utils/user";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  return json({ ok: true });
};

export default function Post() {
  const user = useUser();

  return (
    <>
      <Header />
      New Post
      <br />
      {user.remainingVideos} posts remaining!
    </>
  );
}
