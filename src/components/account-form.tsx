"use client";
 
import { useState, type FormEvent } from "react";
import { login, registerAccount } from "@/lib/api";
 
export function AccountForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
 
  async function submit(event: FormEvent<HTMLFormElement>) {
	event.preventDefault();
	const form = event.currentTarget;
	const data = new FormData(form);
	const username = String(data.get("username")).trim();
	const password = String(data.get("password"));
	setError("");
	setNotice("");
	if (registering && data.get("confirmPassword") !== password) {
  	setError("Your passwords do not match.");
  	return;
	}
	setBusy(true);
	try {
  	if (registering) {
    	await registerAccount(username, password);
    	setRegistering(false);
    	setNotice("Account created. Sign in when you are ready.");
  	} else {
    	const token = await login(username, password);
    	if (!token) throw new Error("The server returned an empty token.");
    	onLogin(token);
  	}
  	form.reset();
	} catch (cause) {
  	setError(cause instanceof Error ? cause.message : "Could not sign in.");
	} finally {
  	setBusy(false);
	}
  }
 
  return (
	<section className="max-w-md space-y-3">
  	<h2 className="text-xl font-semibold">
    	{registering ? "Create an account" : "Sign in"}
  	</h2>
  	<form onSubmit={submit}>
    	<label>Username <input name="username" autoComplete="username" required /></label>
    	<label>
      	Password
      	<input name="password" type="password" required
        	autoComplete={registering ? "new-password" : "current-password"} />
    	</label>
    	{registering && (
      	<label>
        	Confirm password
        	<input name="confirmPassword" type="password"
              autoComplete="new-password" required />
      	</label>
    	)}
    	{error && <p role="alert">{error}</p>}
    	{notice && <p role="status">{notice}</p>}
    	<button disabled={busy}>{registering ? "Register" : "Sign in"}</button>
  	</form>
  	<button type="button" disabled={busy} onClick={() => {
    	setRegistering(!registering);
    	setError("");
    	setNotice("");
  	}}>
    	{registering ? "Back to sign in" : "Create an account"}
      </button>
    </section>
  );
}
