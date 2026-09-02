const PROFILE_KEY = "spextr:steam-profile";
const API_KEY_KEY = "spextr:steam-api-key";

export function loadSteamProfileInput(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PROFILE_KEY) ?? "";
}

export function saveSteamProfileInput(value: string): void {
  window.localStorage.setItem(PROFILE_KEY, value);
}

export function loadSteamApiKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(API_KEY_KEY) ?? "";
}

export function saveSteamApiKey(value: string): void {
  window.localStorage.setItem(API_KEY_KEY, value);
}
