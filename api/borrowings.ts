import Constants from "expo-constants";

export async function FetchBorrowings() {
    const extras = Constants.expoConfig.extra ?? {};
    const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
    const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
    const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;

    try {
        const res = await fetch(`${LIBRARY_API_URL}borrowings/`, {
            method: 'GET',
            headers: {
                'Accept': 'applcition/json',
                'x-api-key': `${LIBRARY_API_KEY}`,
                'Origin': `${LIBRARY_ORIGIN}`,
                'Authorization': '2|qViPMAVbLC2WhnQWJ3EB6hPGVcQy4AK8t8PYL4uU2ea0a470'
            }
        });

        const response = await res.json();

        if(!res.ok) {
            throw new Error(response.message);
        }

        return response;
    }catch(error) {
        throw error;
    }
}