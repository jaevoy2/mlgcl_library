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

export async function fetchBookReservationAvailability(
  bookId: number | string,
) {
  const extras = Constants.expoConfig?.extra ?? {};
  const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
  const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
  const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;
  const AUTH_TOKEN = extras.AUTH_TOKEN as string;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 1min and 30sec

    const base = LIBRARY_API_URL.endsWith("/")
      ? LIBRARY_API_URL
      : LIBRARY_API_URL + "/";
    const response = await fetch(
      `${base}reservations/book-availability?id=${bookId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-api-key": LIBRARY_API_KEY,
          Origin: LIBRARY_ORIGIN,
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    const data = await response.json();
    if (!response.ok || !data.success) {
      return null;
    }
    return data.data || null;
  } catch (error) {
    return null;
  }
}

export async function fetchBookList() {
  const extras = Constants.expoConfig?.extra ?? {};
  const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
  const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
  const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;
  const AUTH_TOKEN = extras.AUTH_TOKEN as string; // Make sure this is set

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const base = LIBRARY_API_URL.endsWith("/")
      ? LIBRARY_API_URL
      : LIBRARY_API_URL + "/";
    const response = await fetch(`${base}books`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": LIBRARY_API_KEY,
        Origin: LIBRARY_ORIGIN,
        Authorization: `Bearer ${AUTH_TOKEN}`, // <-- Add this line
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch book list");
    }
    return data.books || data.data || data || [];
  } catch (error) {
    return [];
  }
}
