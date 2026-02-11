import { FetchReservations } from "@/api/reservations";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Text, View } from "react-native";


type ReservationProps = {
    id: number;
    user_id: number;
    book_copy_id: number;
    expires_at: number;
    claimed_at?: number | null;
}

const { height, width } = Dimensions.get('screen')

export default function ReservationView() {
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState<ReservationProps[] | []>([]);

    
    useEffect(() => {
        handleFetchReservations();
    }, [])


    const handleFetchReservations = async () => {
        try {
            const response = await FetchReservations();
    
            if(!response.error) {
                const reservationData: ReservationProps[] = response.data.map((r) => ({
                    id: r.id,
                    user_id: r.user_id,
                    book_copy_id: r.book_copy_id,
                    expires_at: r.expires_at,
                    claimed_at: r.claimed_at ?? null
                }));
    
                setReservations(reservationData);
            }else {
                Alert.alert('Error', response.message);
            }
        }catch(error: any) {
            console.log('Fetch reservation: ', error.message)
        }finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ backgroundColor: '#fff', height }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3498db', height: 100, width, paddingTop: 40, paddingHorizontal: 20 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Reservation</Text>
            </View>
            {loading == true ? (
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', paddingTop: -20 }}>
                    <ActivityIndicator size={'large'} color={'#3498db'} />
                </View>
            ) : (
                <>
                    <View style={{ flex: 1, padding: 20 }}>
                        {reservations.length == 0 && (
                            <View style={{ height: '100%', alignItems: 'center', paddingTop: 50 }}>
                                <Text style={{ color: '#a8a8a8', fontSize: 16 }}>No reservation record</Text>
                            </View>
                        )}
                    </View>
                </>
            )}
        </View>
    )
}