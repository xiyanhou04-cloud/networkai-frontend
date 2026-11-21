"use client";

import { useCallback, useState } from "react";
import { AccountForm } from "./account-form";
import { Feed } from "./feed";
import { Composer } from "./composer";
import { Studio } from "./studio";
import { PersonalAgent } from "./personal-agent";

export function Workspace() {
  const [token, setToken] = useState("");
  const [revision, setRevision] = useState(0);
  const signOut = useCallback(() => setToken(""), []);

  if (!token) return <AccountForm onLogin={setToken} />;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Signed in</p>
        <button onClick={signOut}>Sign out</button>
      </div>
      <PersonalAgent key={token} token={token} onExpired={signOut} />
      <Composer
        token={token}
        onExpired={signOut}
        onPublished={() => setRevision((value) => value + 1)}
      />
      <Studio token={token} onPublished={() => setRevision((value) => value + 1)} />
      <Feed token={token} onExpired={signOut} revision={revision} />
    </section>
  );
}
