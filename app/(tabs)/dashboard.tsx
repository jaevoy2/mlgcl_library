import { FetchBooks } from "@/api/books";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { height, width } = Dimensions.get('screen');
const logo = require('@/assets/images/logo.png')


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
        <View style={styles.container}>
            {loading == true ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={'#3498db'} size={'large'} />
                </View>
            ) : (
                <>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>MLGCL LIBRARY</Text>
                        <TouchableOpacity onPress={() => router.push('/search')} style={styles.searchButton}>
                            <Ionicons name={'search'} color={'#fff'} size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Content */}
                    <View style={styles.content}>
                        {/* Books Card */}
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <View style={styles.cardLeft}>
                                    <Text style={styles.cardLabel}>Books</Text>
                                    <View style={styles.cardValueRow}>
                                        <MaterialCommunityIcons name={'book-open-page-variant'} size={32} color={'#fff'} />
                                        <Text style={styles.cardValueLarge}>{bookCount}</Text>
                                    </View>
                                </View>
                                <View style={styles.cardRight}>
                                    <Text style={styles.cardLabel}>Total Copies</Text>
                                    <Text style={styles.cardValueMedium}>{bookCopies}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Borrowed Books Card */}
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <View style={styles.cardLeft}>
                                    <Text style={styles.cardLabel}>Borrowed Books</Text>
                                    <View style={styles.cardValueRow}>
                                        <MaterialCommunityIcons name={'book-open-page-variant'} size={32} color={'#fff'} />
                                        <Text style={styles.cardValueLarge}>{borrowedBooks}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => router.push('../borrowing')} 
                                    style={styles.viewDetailsButton}
                                >
                                    <Ionicons name={'open-outline'} size={18} color={'#fff'} />
                                    <Text style={styles.viewDetailsText}>View</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer Text */}
                        <View style={styles.footer}>
                            <Text style={styles.footerTitle}>MLG COLLEGE OF LEARNING, INC.</Text>
                            <Text style={styles.footerSubtitle}>Library Management System v1.0</Text>
                        </View>
                    </View>

                    <View style={styles.floatingCon}>
                        <TouchableOpacity 
                            onPress={() => router.push('/borrow')} 
                            style={styles.fab}
                        >
                            <MaterialCommunityIcons name={'qrcode-scan'} size={28} color={'#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            // onPress={() => router.push('/borrow')} 
                            style={styles.fabReturn}
                        >
                            <MaterialCommunityIcons name={'line-scan'} size={28} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        position: 'relative',
    },
    loadingContainer: {
        width,
        height,
        justifyContent: 'center',
        alignContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3498db',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontWeight: '800',
        fontSize: 16,
        color: '#fff',
        letterSpacing: 1
    },
    searchButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#5DADE2',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    borrowCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLeft: {
        flex: 1,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    cardLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        opacity: 0.95,
    },
    cardValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardValueLarge: {
        fontWeight: '900',
        fontSize: 48,
        color: '#fff',
        lineHeight: 56,
    },
    cardValueMedium: {
        fontWeight: '900',
        fontSize: 36,
        color: '#fff',
        marginTop: 5,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-end',
        marginTop: 15,
    },
    viewDetailsText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
    },
    footerTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#A0B8C5',
        letterSpacing: 1,
        textAlign: 'center',
    },
    footerSubtitle: {
        fontSize: 11,
        fontWeight: '400',
        color: '#C5D4DB',
        marginTop: 5,
        textAlign: 'center',
    },
    floatingCon: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabReturn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#25AD76',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});