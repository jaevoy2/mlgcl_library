import Constants from "expo-constants";

// Fetch book copy details by code
export async function fetchBookCopyDetails(bookcopies_code: string) {
  const extras = Constants.expoConfig?.extra ?? {};
  const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
  const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
  const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;

  try {
    const response = await fetch(`${LIBRARY_API_URL}books/bookCopies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": LIBRARY_API_KEY,
        Origin: LIBRARY_ORIGIN,
        Authorization: `I5MulGCY8dmFEr6xUB2oKtiLiLzEDf8goYBdTmy9RuPt6K0p70Zrb7txhl3bE6Jz`,
      },
      body: JSON.stringify({ bookcopies_code }),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching book copy details:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

// Return book by scan
export async function returnBookByScan(uuid: string) {
  const extras = Constants.expoConfig?.extra ?? {};
  const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
  const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
  const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;
  const AUTH_TOKEN = extras.AUTH_TOKEN as string; // already here, now used

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const base = LIBRARY_API_URL.endsWith("/")
      ? LIBRARY_API_URL
      : LIBRARY_API_URL + "/";
    const response = await fetch(`${base}return/scan-book`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": LIBRARY_API_KEY,
        Origin: LIBRARY_ORIGIN,
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ qr_uuid: uuid }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to return book");
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
