import { SearchBook } from "@/api/search";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export type BookProps = {
    id?: number;
    author?: string;
    title?: string;
    subtitle?: string;
    published?: string;
    classification?: string;
    language?: string;
    availableCopies?: number;
    code?: string;
    borrowings?: {};
    reservations?: {};
};

const { height, width } = Dimensions.get('window');

export default function SearchView() {
    const [searchValue, setSearchValue] = useState('');
    const [books, setBooks] = useState<BookProps[] | []>([]);
    const [selectedBook, setSelectedBook] = useState<BookProps | null>(null);
    const slideAnim = useRef(new Animated.Value(height)).current; // initial position offscreen

    useEffect(() => {
        if (searchValue.length === 0) return;

        const timeout = setTimeout(() => {
            handleOnSearch();
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchValue]);

    const handleOnSearch = async () => {
        try {
            const response = await SearchBook(searchValue.trim());
            if (!response.error) {
                const searchData: BookProps[] = response.data.map((book: any) => ({
                    id: book.id,
                    author: `${book.authors[0].first_name} ${book.authors[0].last_name}`,
                    title: book.title,
                    subtitle: book?.subtitle ?? 'No Subtitle',
                    published: book.publication_year,
                    classification: book.classification.description,
                    language: book.language.name,
                    availableCopies: book.copies?.length ?? 0,
                    code: book.books_code,
                }));
                setBooks(searchData);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const openModal = (book: BookProps) => {
        setSelectedBook(book);
        Animated.timing(slideAnim, {
            toValue: height * 0.2, // modal top position
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedBook(null));
    };

    const BookItem = React.memo(({ bookData }: { bookData: BookProps }) => {
        return (
            <TouchableOpacity
                onPress={() => openModal(bookData)}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderColor: '#cccccc',
                    borderWidth: 1,
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                    borderRadius: 5,
                    marginVertical: 3,
                }}
            >
                <View style={{ width: '65%' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{bookData.title}</Text>
                    <Text style={{ opacity: 0.5 }}>{bookData.subtitle}</Text>
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ opacity: 0.5, fontSize: 10 }}>Book Code</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600' }}>{bookData.code}</Text>
                </View>
            </TouchableOpacity>
        );
    });

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 40, backgroundColor: '#3498db' }} />
            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 25, fontWeight: '700', opacity: 0.7 }}>Search Book</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Ionicons name={'arrow-back'} size={18} />
                        <Text style={{ fontSize: 16 }}>Back</Text>
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        position: 'relative',
                        marginTop: 10,
                        borderColor: 'transparent',
                        backgroundColor: '#E6E6E6',
                        borderWidth: 1,
                        borderRadius: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 10,
                    }}
                >
                    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
                        <Ionicons name={'search'} size={20} color={'#868686'} />
                        <TextInput
                            value={searchValue}
                            onChangeText={(text) => setSearchValue(text)}
                            placeholder="Search"
                            placeholderTextColor="#868686"
                            style={{ fontSize: 13, fontWeight: '600', width: '80%', color: '#000' }}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setSearchValue('');
                            setBooks([]);
                        }}
                        style={{ borderLeftWidth: 1, borderLeftColor: '#cfcfcfd0', paddingLeft: 10 }}
                    >
                        {searchValue.length > 0 && <Ionicons name={'close'} size={20} color={'#868686'} />}
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 20, height: height - 180 }}>
                    {books.length > 0 ? (
                        <FlatList
                            data={books}
                            keyExtractor={(books) => String(books.id)}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => <BookItem bookData={item} />}
                            getItemLayout={(item, index) => ({
                                length: 90,
                                offset: 90 * index,
                                index,
                            })}
                        />
                    ) : (
                        <View>
                            <Text style={{ opacity: 0.5, textAlign: 'center' }}>Book not found</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Modal */}
<Modal
    animationType="slide"
    transparent={true}
    visible={!!selectedBook}
    onRequestClose={() => setSelectedBook(null)}
>
    <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    }}>
        <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: height * 0.9,
        }}>
            {/* Modal Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
            }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2c3e50' }}>
                    Book Details
                </Text>
                <TouchableOpacity onPress={() => setSelectedBook(null)}>
                    <Ionicons name="close" size={28} color="#2c3e50" />
                </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
                style={{ paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {selectedBook && (
                    <>
                        {/* Book Information */}
                        <View style={{ marginTop: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <Ionicons name="book" size={24} color="#3498db" />
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2c3e50' }}>
                                    Book Information
                                </Text>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                    Title
                                </Text>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                    {selectedBook.title || 'N/A'}
                                </Text>
                            </View>

                            {selectedBook.subtitle && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                        Subtitle
                                    </Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                        {selectedBook.subtitle}
                                    </Text>
                                </View>
                            )}

                            {selectedBook.author && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                        Author
                                    </Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                        {selectedBook.author}
                                    </Text>
                                </View>
                            )}

                            {selectedBook.published && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                        Published Year
                                    </Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                        {selectedBook.published}
                                    </Text>
                                </View>
                            )}

                            {selectedBook.classification && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                        Classification
                                    </Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                        {selectedBook.classification}
                                    </Text>
                                </View>
                            )}

                            {selectedBook.language && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                        Language
                                    </Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                        {selectedBook.language}
                                    </Text>
                                </View>
                            )}

                            {selectedBook.availableCopies !== undefined && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                        Available Copies
                                    </Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                        {selectedBook.availableCopies}
                                    </Text>
                                </View>
                            )}

                            {selectedBook.code && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d', marginBottom: 4 }}>
                                        Book Code
                                    </Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c3e50' }}>
                                        {selectedBook.code}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#3498db',
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: 'center',
                    }}
                    onPress={() => setSelectedBook(null)}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>
        </View>
    );
}