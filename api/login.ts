import Constants from "expo-constants";

export async function Login(email: string, password: string, device_token: string) {
    const extras = Constants.expoConfig?.extra ?? {};
    const PORTAL_URL = extras.PORTAL_URL as string;
    const PORTAL_API_KEY = extras.PORTAL_API_KEY as string;
    const PORTAL_ORIGIN = extras.PORTAL_ORIGIN as string;

    try {
        const res = await fetch(`${PORTAL_URL}login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${PORTAL_API_KEY}`,
                'Origin': `${PORTAL_ORIGIN}`
            },
            body:  JSON.stringify({ email, password, device_token })
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