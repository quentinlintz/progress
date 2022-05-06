import { destroySession, getSession } from "../utils/supabase.server";
import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  return redirect("/signup", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export const loader = () => {
  // Redirect to `/` if user tried to access `/signout`
  return redirect("/streams");
};
