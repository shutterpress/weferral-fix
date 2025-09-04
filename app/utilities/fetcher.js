import Alert from "react-s-alert";
import "whatwg-fetch";

/**
 * Unified fetch helper
 * - Single declaration
 * - Parses JSON only when content-type is JSON
 * - Shows server HTML errors in thrown message
 */
async function Fetcher(path, method = "GET", body, init = null) {
  const options = init ? { ...init } : {};
  options.method = method;

  // default headers only if not provided
  const defaultHeaders = new Headers({ "Content-Type": "application/json" });
  options.headers = new Headers(options.headers || defaultHeaders);

  // auth headers from storage
  if (!options.headers.has("Authorization")) {
    const jwt = localStorage.getItem("jwtToken");
    const bearer = localStorage.getItem("bearerToken");
    if (jwt) options.headers.append("Authorization", `JWT ${jwt}`);
    if (bearer) options.headers.append("Authorization", `Bearer ${bearer}`);
  }

  options.credentials = options.credentials || "include";

  if (body !== undefined && body !== null) {
    const ct = options.headers.get("Content-Type") || "";
    options.body =
      ct.includes("application/json") && typeof body !== "string"
        ? JSON.stringify(body)
        : body;
  }

  const res = await fetch(path, options);
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    if (data && typeof data === "object") {
      if (data.error) Alert.error(data.error);
      if (data.message) Alert.info(data.message);
    }
    const snippet =
      typeof data === "string"
        ? data.slice(0, 400)
        : JSON.stringify(data).slice(0, 400);
    const err = new Error(`${res.status} ${res.statusText} ${snippet}`);
    err.status = res.status;
    err.statusText = res.statusText;
    err.body = data;
    throw err;
  }

  if (data && typeof data === "object") {
    if (data.error) Alert.error(data.error);
    if (data.message) Alert.info(data.message);
  }

  return data;
}

export { Fetcher };
export default Fetcher;
