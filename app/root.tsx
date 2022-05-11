import React, { useContext, useEffect } from "react";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { SupabaseProvider } from "./utils/supabase-client";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { getUser } from "./models/user.server";
import globalStyles from "./styles/global.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Progress",
  viewport: "width=device-width,initial-scale=1",
});

export let links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstaticom" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Prompt:wght@100;200;300;400;500;600;700&display=swap",
    },
    { rel: "stylesheet", href: globalStyles },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  return {
    user: await getUser(request),
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
  };
};

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

const theme = extendTheme({
  useSystemColorMode: "false",
  initialColorMode: "system",
  styles: {
    global: (props: any) => ({
      body: {
        fontFamily: "Prompt",
      },
    }),
  },
});

export default function App() {
  const loader = useLoaderData();
  const supabase = createClient(loader.supabaseUrl, loader.supabaseKey);

  return (
    <Document>
      <SupabaseProvider supabase={supabase}>
        <ChakraProvider theme={theme}>
          <Outlet />
        </ChakraProvider>
      </SupabaseProvider>
    </Document>
  );
}
