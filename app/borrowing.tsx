import { FetchBorrowings } from "@/api/borrowings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";


type BookBorrowingProps = {
    id: number;
    book_copy_id: number;
    borrowed_at: number;
    returned_at: number;
    user_id: number;
}

const { height, width } = Dimensions.get('screen')

export default function BorrowingsView() {
    const [loading, setLoading] = useState(true);
    const [borrowings, sestBorrowings] = useState<BookBorrowingProps[] | []>([]);

    
    useEffect(() => {
        handleFetchBorrowings();
    }, [])


    const handleFetchBorrowings = async () => {
        try {
            const response = await FetchBorrowings();
    
            if(!response.error) {
                const borrowingsData: BookBorrowingProps[] = response.data.map((b) => ({
                    id: b.id,
                    book_copy_id: b.book_copy_id,
                    borrowed_at: b.borrowed_at,
                    returned_at: b.returned_at,
                    user_id: b.user_id
                }));
    
                sestBorrowings(borrowingsData);
                console.log(borrowingsData)
            }else {
                Alert.alert('Error', response.message);
            }
        }catch(error: any) {
            console.log('Fetch borrowings: ', error.message)
        }finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ backgroundColor: '#fff', height }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3498db', height: 100, width, paddingTop: 40, paddingHorizontal: 20 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name={'arrow-back'} color={'#fff'} size={25} />
                </TouchableOpacity>
            </View>
            {loading == true ? (
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                    <ActivityIndicator size={'large'} color={'#3498db'} />
                </View>
            ) : (
                <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={{ fontWeight: '900', fontSize: 18, color: '#464646', letterSpacing: 1 }}>Borrowings</Text>
                    <View style={{ paddingTop: 50 }}>
                        {borrowings.length == 0 && (
                            <View style={{ height: '100%', alignItems: 'center', paddingTop: 50 }}>
                                <Text style={{ color: '#a8a8a8', fontSize: 16 }}>No borrowing record</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    )
}