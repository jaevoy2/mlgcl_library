import Constants from "expo-constants";

export async function fetchReservationRecords() {
  const extras = Constants.expoConfig?.extra ?? {};
  const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
  const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
  const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const base = LIBRARY_API_URL.endsWith("/")
      ? LIBRARY_API_URL
      : LIBRARY_API_URL + "/";
    const response = await fetch(`${base}reservations`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": LIBRARY_API_KEY,
        Origin: LIBRARY_ORIGIN,
        Authorization: `I5MulGCY8dmFEr6xUB2oKtiLiLzEDf8goYBdTmy9RuPt6K0p70Zrb7txhl3bE6Jz`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch reservations");
    }
    return data;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.name === "AbortError"
            ? "Request timed out"
            : error.message
          : "Unknown error",
    };
  }
}
