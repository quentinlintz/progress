import { useSubmit } from "@remix-run/react";
import Header from "~/components/Header";
import { Button, Container } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSupabase } from "~/utils/supabase-client";
import { requireUserId } from "~/models/user.server";
import { useUser } from "~/utils/user";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  return json({ ok: true });
};

export default function Profile() {
  const user = useUser();
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
