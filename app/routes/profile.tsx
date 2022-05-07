import { useLoaderData, useSubmit } from "@remix-run/react";
import Header from "~/components/Header";
import { Button, Container } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSupabase } from "~/utils/supabase-client";
import { getUserById, requireUserId } from "~/models/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  return json({ ok: true, user });
};

export default function Profile() {
  const loader = useLoaderData();
  const user = loader.user;
  const submit = useSubmit();
  const supabase = useSupabase();

  const handleSignOut = () => {
    supabase.auth.signOut().then(() => {
      submit(null, { method: "post", action: "/signout" });
    });
  };

  return (
    <>
      <Header />
      <Container>
        {supabase.auth.session() && (
          <Button onClick={handleSignOut}>Sign out for {user.email}</Button>
        )}
      </Container>
    </>
  );
}
