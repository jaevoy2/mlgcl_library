import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export async function ValidateUserQr(userQrCode: string) {
    const extras = Constants.expoConfig?.extra ?? {};
    const PORTAL_URL = extras.PORTAL_URL;
    const PORTAL_API_KEY = extras.PORTAL_API_KEY;
    const PORTAL_ORIGIN = extras.PORTAL_ORIGIN;

    try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(`${PORTAL_URL}qr-code/user/${userQrCode}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': `${PORTAL_API_KEY}`,
                'Origin': `${PORTAL_ORIGIN}`,
                'Authorization': `Bearer ${token}`
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