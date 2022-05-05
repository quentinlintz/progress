import React, { useEffect } from "react";
import { Auth } from "@supabase/ui";
import { useSupabase } from "~/utils/supabase-client";
import { useSubmit } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const session = await getSession(request.headers.get("Cookie"));

  session.set("access_token", formData.get("access_token"));

  return redirect("/streams", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function SignIn() {
  const supabase = useSupabase();

  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Container>
        <Auth supabaseClient={supabase} providers={["twitch"]} />
      </Container>
    </Auth.UserContextProvider>
  );
}

const Container: React.FC = ({ children }) => {
  const { user, session } = Auth.useUser();
  const submit = useSubmit();

  useEffect(() => {
    if (user) {
      const formData = new FormData();

      const accessToken = session?.access_token;

      // you can choose whatever conditions you want
      // as long as it checks if the user is signed in
      if (accessToken) {
        formData.append("access_token", accessToken);
        submit(formData, { method: "post", action: "/auth" });
      }
    }
  }, [user]);

  return <>{children}</>;
};

// ...
