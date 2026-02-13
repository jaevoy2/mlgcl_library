import { FetchBooks } from "@/api/books";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";

const { height, width } = Dimensions.get('window');


export default function BooksView() {
    const [loading, setLoading] = useState(false);
    const [bookCount, setBookCount] = useState(0)
    const [borrowedBooks, setBorrowedBooks] = useState(0)
    const [bookCopies, setBookCopies] = useState(0);

    useEffect(() => {
        handleFetchBooks();
    }, [])

    const handleFetchBooks = async() => {
        try {
            const response = await FetchBooks();

            if(!response.error) {
                setBookCount(response.book_count);
                setBookCopies(response.copy_count);
                setBorrowedBooks(response.borrowed_count);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message || 'Failed to load data. Please check your internet connection');
        }finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace('/')
    } 

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', position: 'relative' }}>
            {loading == true ? (
                <View style={{ width, height, justifyContent: 'center', alignContent: 'center' }}>
                    <ActivityIndicator color={'#3498db'} size={'large'} />
                </View>
            ) : (
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3498db', height: 100, width, paddingTop: 40, paddingHorizontal: 20 }}>
                        <Text style={{ fontWeight: '700', fontSize: 16, color: '#fff' }}>Boyet Dedal</Text>
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <TouchableOpacity onPress={() => router.push('/search')}>
                                <Ionicons name={'search'} color={'#fff'} size={25} />
                            </TouchableOpacity>
                            <Ionicons name={'person-circle-outline'} size={28} color={'#fff'} />
                        </View>
                    </View>
                    <View style={{ paddingTop: 30, paddingHorizontal: 20, gap: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', height: 100, padding: 20, borderRadius: 10, shadowColor: "#000", position: 'relative' }}>
                            <LinearGradient
                                colors={['#3498db', 'rgba(52, 152, 219, 0.88)',  'rgb(82, 179, 243)',  'rgb(148, 205, 243)' ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={{ height: 100, position: 'absolute', width: width - 40 , bottom: 0, zIndex: -1, borderRadius: 10 }}
                            />
                            <View>
                                <Text style={{ color: '#fff' }}>Books</Text>
                                <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <MaterialCommunityIcons name={'book-open-page-variant'} size={30} color={'#fff'} />
                                    <Text style={{ fontWeight: '900', fontSize: 28, color: '#fff' }}>{bookCount}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Text style={{ color: '#fff' }}>Book Copies</Text>
                                <Text style={{ fontWeight: '900', fontSize: 20, color: '#fff' }}>{bookCopies}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', height: 100, padding: 20, borderRadius: 10, shadowColor: "#000", position: 'relative' }}>
                            <LinearGradient
                                colors={['#3498db', 'rgba(52, 152, 219, 0.88)',  'rgb(82, 179, 243)', 'rgb(148, 205, 243)' ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={{ height: 100, position: 'absolute', width: width - 40 , bottom: 0, zIndex: -1, borderRadius: 10 }}
                            />
                            <View>
                                <Text style={{ color: '#fff' }}>Borrowed Books</Text>
                                <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <MaterialCommunityIcons name={'book-open-page-variant'} size={30} color={'#fff'} />
                                    <Text style={{ fontWeight: '900', fontSize: 28, color: '#fff' }}>{borrowedBooks}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/borrowing')} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                <Ionicons name={'open-outline'} size={20} color={'#fff'} />
                                <Text style={{ color: '#fff', fontSize: 16 }}>View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/borrow')} style={{ padding: 20, backgroundColor: '#3498db', borderRadius: 50, position: 'absolute', right: 20, bottom: 50 }}>
                        <MaterialCommunityIcons name={'qrcode-scan'} size={25} color={'#fff'} />
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => handleLogout()} style={{ padding: 20, backgroundColor: '#3498db', borderRadius: 50, position: 'absolute', right: 20, bottom: 50 }}>
                        <Text>Logout</Text>
                    </TouchableOpacity> */}
                </>
            )}
        </View>
    )
}