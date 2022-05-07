import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { destroySession, getSession } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export const loader = () => {
  // Redirect to `/` if user tried to access `/signout`
  return redirect("/");
};
