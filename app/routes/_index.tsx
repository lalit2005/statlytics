import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <div className="max-w-3xl w-full mx-auto px-4 mt-20">
        <h1 className="text-xl font-medium">Statlytics</h1>
        <p className="text-zinc-400 mt-2">
          A simple analytics platform to analyze traffic and user behaviour in
          websites and apps. Metrics like pageviews, browser usage, users
          location etc. can be tracked.
        </p>
        <p className="text-zinc-400 mt-2">
          Statlytics is completely open source. Teams can self host Statlytics
          in their servers thereby preserving the privacy of users.
        </p>
        <p className="mt-3">
          <a
            className="bg-zinc-100 text-zinc-600 text-base font-medium rounded px-3 py-1"
            href="/login"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
