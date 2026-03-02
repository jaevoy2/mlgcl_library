import { ConfirmBorrow } from "@/api/confirmBorrow";
import { useBorrowBook } from "@/context/borrow";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Text, TouchableOpacity, View } from "react-native";


const { height, width } = Dimensions.get('screen')

export default function BorrowInfo() {
    const { borrowedBook, setBorrowedBook } = useBorrowBook();
    const [loading, setLoading] = useState(true);
    const [confirmSpinner, setConfirmSpinnerr] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 600)
    }, [])


    const handleConfirmBorrow = async() => {
        setConfirmSpinnerr(true);

        try {
            const response = await ConfirmBorrow(borrowedBook)

            if(!response.error) {
                Alert.alert('Success', response.success, [{
                    text: 'OK',
                    onPress: () => {{ setBorrowedBook(null) ,router.replace('/dashboard') }}
                }]);
            }

        }catch(error: any) {
            Alert.alert('Invalid', error.message);
        }finally {
            setConfirmSpinnerr(false);
        }
    }



    return (
        <View style={{ backgroundColor: '#f8f8f8', height: '100%',  position: 'absolute', top: 0, width }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3498db', height: 100, width, paddingTop: 40, paddingHorizontal: 20 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Borrow Details</Text>
            </View>
            {loading == true ? (
                <View style={{ height, alignContent: 'center', paddingTop: 100, }}>
                    <ActivityIndicator size={'large'} color={'#3498db'} />
                </View>
            ) : (
                <View style={{ flexDirection: 'column', height: '90%', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 }}>
                    <View>
                        <View>
                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 25, fontWeight: '900' }}>{borrowedBook?.bookTitle}</Text>
                                <Text style={{ fontSize: 16, marginTop: 5, fontStyle: 'italic', opacity: 0.6 }}>{borrowedBook?.bookSubtitle}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                <View>
                                    <Text style={{ opacity: 0.5, fontSize: 13 }}>Book Author</Text>
                                    <Text style={{ fontWeight: '800', fontSize: 16 }}>{borrowedBook?.bookAuthor}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ opacity: 0.5, fontSize: 13 }}>Classification</Text>
                                    <Text style={{ fontWeight: '800', fontSize: 16 }}>{borrowedBook?.bookClassification}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                                <View>
                                    <Text style={{ opacity: 0.5, fontSize: 13 }}>Language</Text>
                                    <Text style={{ fontWeight: '800', fontSize: 16 }}>{borrowedBook?.bookLanguage}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ opacity: 0.5, fontSize: 13 }}>Year Published</Text>
                                    <Text style={{ fontWeight: '800', fontSize: 16 }}>{borrowedBook?.bookPublished}</Text>
                                </View>
                            </View>
                        </View>
                        
                        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#fff',  elevation: 2, borderRadius: 12 }}>
                            <View style={{ alignItems: 'center', borderRightWidth: 1, borderColor: '#dbdbdb', width: '33%' }}>
                                <Text style={{ opacity: 0.5, fontWeight: '800' }}>Available</Text>
                                <Text style={{ fontWeight: '800', fontSize: 16 }}>{borrowedBook?.availableCopies}</Text>
                            </View>
                            <View style={{ alignItems: 'center', borderRightWidth: 1, borderColor: '#dbdbdb', width: '33%' }}>
                                <Text style={{ opacity: 0.5, fontWeight: '800' }}>Borrowed</Text>
                                <Text style={{ fontWeight: '800', fontSize: 16 }}>{borrowedBook?.borrowed}</Text>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: '33%' }}>
                                <Text style={{ opacity: 0.5, fontWeight: '800' }}>Reserved</Text>
                                <Text style={{ fontWeight: '800', fontSize: 16 }}>{borrowedBook?.reserved}</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 50 }}>
                            <Text style={{ opacity: 0.5, fontSize: 18, fontWeight: '800' }}>Borrower Details</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 20, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 12, marginTop: 15, elevation: 2, borderRadius: 12 }}>
                                <Image source={{ uri: borrowedBook?.userImage }} style={{ height: 80, width: 80, borderRadius: 10 }} />
                                <View style={{ width: '60%' }}>
                                    <Text style={{ fontSize: 17, fontWeight: '900' }}>{borrowedBook?.userName}</Text>
                                    <Text style={{ marginTop: 5, backgroundColor: '#EAF4FB', color: '#3498db', fontWeight: '800', fontSize: 10, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>{borrowedBook?.userType.toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity disabled={confirmSpinner} onPress={() => handleConfirmBorrow()} style={{ paddingVertical: 15, backgroundColor: '#3498db', width: '100%', borderRadius: 5 }}>
                            {confirmSpinner == true ? (
                                <View style={{ alignSelf: 'center' }}>
                                    <ActivityIndicator color={'#fff'} size={'small'} />
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                                    <Ionicons name={'checkmark-circle'} color={'#fff'} size={20} /> 
                                    <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center', fontSize: 16 }}>Confirm</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {setBorrowedBook(null), router.replace('/(tabs)/dashboard')}} style={{ paddingVertical: 15, borderRadius: 5 }}>
                            <Text style={{ color: '#797979', fontWeight: '800', textAlign: 'center', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View> 
    )
}