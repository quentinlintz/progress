import { Auth } from "@supabase/ui";
import { useSearchParams, useSubmit } from "@remix-run/react";
import React, { useEffect } from "react";
import { useSupabase } from "~/utils/supabase-client";
import Header from "~/components/Header";
import { Container } from "@chakra-ui/react";
import { commitSession, getSession } from "~/utils/supabase.server";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const session = await getSession(request.headers.get("Cookie"));

  session.set("access_token", formData.get("access_token"));
  session.set("userId", formData.get("userId"));

  return redirect("/videos", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const AuthContainer: React.FC = ({ children }) => {
  const { user, session } = Auth.useUser();
  const submit = useSubmit();

  useEffect(() => {
    if (user) {
      const formData = new FormData();

      const accessToken = session?.access_token;

      if (accessToken) {
        formData.append("access_token", accessToken);
        formData.append("userId", user.id);
        submit(formData, { method: "post", action: "/signin" });
      }
    }
  }, [user]);

  return <>{children}</>;
};

export default function SignIn() {
  const supabase = useSupabase();

  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Header />
      <Container>
        <AuthContainer>
          <Auth supabaseClient={supabase} />
        </AuthContainer>
      </Container>
    </Auth.UserContextProvider>
  );
}
