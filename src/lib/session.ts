export function usernameFromToken(token: string): string {
  try {
	const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
	const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
	const claims = JSON.parse(new TextDecoder().decode(bytes));
	return typeof claims.username === "string" ? claims.username : "";
  } catch {
	return "";
  }
}
