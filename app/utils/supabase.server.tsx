import { createClient } from "@supabase/supabase-js";
import { createCookieSessionStorage } from "@remix-run/node";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "supabase-session",
    },
  });

export { getSession, commitSession, destroySession };

export const setAuthToken = async (request: Request) => {
  let session = await getSession(request.headers.get("Cookie"));

  supabase.auth.setAuth(session.get("access_token"));

  return session;
};
