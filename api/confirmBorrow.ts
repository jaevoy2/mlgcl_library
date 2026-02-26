import { BorrowProps } from "@/context/borrow";
import Constants from "expo-constants";


export async function ConfirmBorrow(borrowData: BorrowProps) {
    const extras = Constants.expoConfig?.extra ?? {};
    const LIBRARY_API_URL = extras.LIBRARY_API_URL as string;
    const LIBRARY_API_KEY = extras.LIBRARY_API_KEY as string;
    const LIBRARY_ORIGIN = extras.LIBRARY_ORIGIN as string;

    try {
        const res = await fetch(`${LIBRARY_API_URL}borrowings/comfirm-borrow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': `${LIBRARY_API_KEY}`,
                'Origin': `${LIBRARY_ORIGIN}`,
                'Authorization': 'I5MulGCY8dmFEr6xUB2oKtiLiLzEDf8goYBdTmy9RuPt6K0p70Zrb7txhl3bE6Jz'
            },
            body: JSON.stringify({ 
                book_copy_id: borrowData.bookCopyId,
                user_id: borrowData.userId,
                borrower_type: borrowData.userType
            })
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