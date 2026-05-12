import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export async function FetchBorrowings() {
  const extras = Constants.expoConfig?.extra ?? {};
  const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
  const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
  const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;
  const LIBRARY_AUTH_TOKEN =
    (extras.LIBRARY_AUTH_TOKEN as string) || (extras.AUTH_TOKEN as string);

  try {
    const token =
      (await AsyncStorage.getItem("access_token")) || LIBRARY_AUTH_TOKEN;
    if (!token) throw new Error("Missing access token. Please log in again.");

    const res = await fetch(`${LIBRARY_API_URL}borrowings/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": `${LIBRARY_API_KEY}`,
        Origin: `${LIBRARY_ORIGIN}`,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response.message || "Failed to fetch borrowings");
    }

    return response;
  } catch (error) {
    throw error;
  }
}
