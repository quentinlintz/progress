import { useSubmit } from "@remix-run/react";
import { useSupabase } from "../utils/supabase-client";
import Header from "~/components/Header";
import { Button } from "@chakra-ui/react";

export default function Profile() {
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
      {supabase.auth.session() && (
        <Button onClick={handleSignOut}>Sign out</Button>
      )}
    </>
  );
}
