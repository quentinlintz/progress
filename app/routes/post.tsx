import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import Header from "~/components/Header";
import {
  getUserById,
  requireUserId,
  updateRemainingVideos,
} from "~/models/user.server";
import { addVideo } from "~/models/videos.server";

function validateTwitchUrl(url: unknown): url is string {
  return typeof url === "string" && url.startsWith("https://www.twitch.tv/");
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  return json({ ok: true, user });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const currentUser = await getUserById(userId);
  const remainingVideos = currentUser?.remainingVideos ?? 1;

  const reqBody = await request.formData();
  const body = Object.fromEntries(reqBody);
  const { url, title, description, tags } = body;

  const tagArray = String(tags).split(",");
  const isInvalidTagArray = tagArray
    .map((tag) => tag.length > 20 || tag.length < 1)
    .includes(true);

  const errors = {
    url: !validateTwitchUrl(url)
      ? "Invalid Twitch URL (https://www.twitch.tv/...)"
      : undefined,
    title:
      String(title).length > 140 || String(title).length < 3
        ? "Title should be between 3 and 140 characters"
        : undefined,
    description:
      String(description).length > 300 || String(description).length < 3
        ? "Description should be between 3 and 300 characters"
        : undefined,
    tags:
      tagArray.length > 10
        ? "Max number of tags is 10"
        : isInvalidTagArray
        ? "Tags should be between 1 and 20 characters"
        : undefined,
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json(errors);
  }

  try {
    const addedVideo = await addVideo({
      userId,
      url: String(url),
      thumbnail: String(""),
      title: String(title),
      description: String(description),
      tags: tagArray,
    });

    await updateRemainingVideos(userId, remainingVideos - 1);

    return json({ errors: undefined, addedVideo });
  } catch (error: any) {
    return json({ error: error.message });
  }
};

export default function Post() {
  const loader = useLoaderData();
  const user = loader.user;
  const errors = useActionData();
  const transition = useTransition();

  const remainingVideos = user.remainingVideos;
  const noRemainingVideos = remainingVideos === 0;

  return (
    <div className="mt-4 text-slate-200">
      <Header />
      <div className="mt-4">
        <h1 className="mt-4 text-4xl font-bold">New Post</h1>
        {noRemainingVideos ? (
          <>
            <p>Post limit reached: delete older videos to post new ones.</p>
          </>
        ) : (
          <Form method="post">
            <fieldset
              disabled={transition.state === "submitting"}
              className="mt-8 w-full"
            >
              <div className="flex h-screen flex-col place-items-center">
                <input
                  name="url"
                  id="url"
                  placeholder="Video URL"
                  className="w-full rounded-sm bg-slate-800 p-4 text-slate-200 disabled:bg-slate-900 md:w-1/2"
                />
                {errors && <p className="text-sm text-red-700">{errors.url}</p>}
                <input
                  name="title"
                  id="title"
                  placeholder="Title"
                  className="mt-4 w-full rounded-sm bg-slate-800 p-4 text-slate-200 disabled:bg-slate-900 md:w-1/2"
                />
                {errors && (
                  <p className="text-sm text-red-700">{errors.title}</p>
                )}
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  placeholder="Description"
                  className="mt-4 w-full rounded-sm bg-slate-800 p-4 text-slate-200 disabled:bg-slate-900 md:w-1/2"
                />
                {errors && (
                  <p className="text-sm text-red-700">{errors.description}</p>
                )}
                <input
                  name="tags"
                  id="tags"
                  placeholder="Tags (comma separated)"
                  className="mt-4 w-full rounded-sm bg-slate-800 p-4 text-slate-200 disabled:bg-slate-900 md:w-1/2"
                />
                {errors && (
                  <p className="text-sm text-red-700">{errors.tags}</p>
                )}
                <button
                  type="submit"
                  className="mt-4 w-full rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600 md:w-1/2 disabled:hover:bg-slate-800"
                >
                  Create ({remainingVideos} remaining)
                </button>
              </div>
            </fieldset>
          </Form>
        )}
      </div>
    </div>
  );
}
