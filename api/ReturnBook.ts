import Constants from "expo-constants";

const extras = Constants.expoConfig?.extra ?? {};
const LIBRARY_API_URL: string = extras.LIBRARY_API_URL ?? "";
const LIBRARY_API_KEY: string = extras.LIBRARY_API_KEY ?? "";
const LIBRARY_ORIGIN: string = extras.LIBRARY_ORIGIN ?? "";
const AUTH_TOKEN: string = extras.AUTH_TOKEN ?? "";

const baseUrl = LIBRARY_API_URL.endsWith("/")
  ? LIBRARY_API_URL
  : LIBRARY_API_URL + "/";

function buildHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": LIBRARY_API_KEY,
    Origin: LIBRARY_ORIGIN,
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };
}

async function postWithTimeout<T>(
  endpoint: string,
  body: Record<string, unknown>,
  timeoutMs = 15000,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error.name === "AbortError"
        ? new Error("Request timed out")
        : error;
    }
    throw new Error("Unknown error");
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiError = { success: false; message: string };

export type BookCopyDetailsResponse = {
  success: boolean;
  message?: string;
  // extend with your actual fields as needed
  [key: string]: unknown;
};

export type FineDetails = {
  amount: number;
  description: string;
  days_overdue?: number;
  waived_days?: number;
};

export type ReturnBookResponse = {
  success: boolean;
  message: string;
  copy?: {
    id: number;
    bookcopies_code: string;
    title: string;
    status: string;
  };
  fine?: FineDetails | null;
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Fetch book copy details by accession/copy code.
 */
export async function fetchBookCopyDetails(
  bookcopies_code: string,
): Promise<BookCopyDetailsResponse | ApiError> {
  try {
    return await postWithTimeout<BookCopyDetailsResponse>("books/bookCopies", {
      bookcopies_code,
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Preview a return — calculates fine without committing any changes.
 * Hits the dedicated /return/preview-return endpoint.
 */
export async function previewBookReturn(
  uuid: string,
  opts?: { waiveFine?: boolean; waivedDays?: number },
): Promise<ReturnBookResponse | ApiError> {
  const { waiveFine = false, waivedDays = 0 } = opts ?? {};
  try {
    return await postWithTimeout<ReturnBookResponse>("return/preview-return", {
      qr_uuid: uuid,
      waive_fine: waiveFine,
      waived_days: waivedDays,
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Commit the book return, recording any applicable fine.
 * Hits the dedicated /return/scan-book endpoint.
 */
export async function returnBookByScan(
  uuid: string,
  opts?: { waiveFine?: boolean; waivedDays?: number },
): Promise<ReturnBookResponse | ApiError> {
  const { waiveFine = false, waivedDays = 0 } = opts ?? {};
  try {
    return await postWithTimeout<ReturnBookResponse>("return/scan-book", {
      qr_uuid: uuid,
      waive_fine: waiveFine,
      waived_days: waivedDays,
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
