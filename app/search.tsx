import { SearchBook } from "@/api/search";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";


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
    borrowings?: {
        //
    },
    reservations?: {
        //
    }
}


const { height, width } = Dimensions.get('window');

export default function SearchView() {
    const [searchValue, setSearchValue] = useState('');
    const [books, setBooks] = useState<BookProps[] | []>([]);

    useEffect(() => {
        if(searchValue.length == 0) return;

        setTimeout(() => {
            handleOnSearch();
        }, 400);
    }, [searchValue])

    const handleOnSearch = async() => {
        try {
            const response = await SearchBook(searchValue.trim());

            if(!response.error) {
                const searchData: BookProps[] = response.data.map((book: any) => ({
                    id: book.id,
                    author: `${book.authors[0].first_name} ${book.authors[0].last_name}`,
                    title: book.title,
                    subtitle: book?.subtitle ?? 'No Subtitle',
                    published: book.publication_year,
                    classification: book.classification.description,
                    language: book.language.name,
                    availableCopies: book.copies?.length ?? 0,
                    code: book.books_code
                }));

                setBooks(searchData);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }
    }

    const BookItem = React.memo(({ bookData }: { bookData: BookProps }) => {
        return (
            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderColor: '#cccccc', borderWidth: 1, paddingVertical: 20, paddingHorizontal: 10, borderRadius: 5, marginVertical: 3 }}>
                <View style={{ width: '65%' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{bookData.title}</Text>
                    <Text style={{ opacity: 0.5 }}>{bookData.subtitle}</Text>
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ opacity: 0.5, fontSize: 10 }}>Book Code</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600' }}>{bookData.code}</Text>
                </View>
            </TouchableOpacity>
        )
    })

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 40, backgroundColor: '#3498db' }}/>
            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 25, fontWeight: '700', opacity: 0.7 }}>Search Book</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Ionicons name={'arrow-back'} size={18} />
                        <Text style={{ fontSize: 16 }}>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ position: 'relative', marginTop: 10, borderColor: 'transparent', backgroundColor: '#E6E6E6', borderWidth: 1, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
                        <Ionicons name={'search'} size={20} color={'#868686'} />
                        <TextInput value={searchValue} onChangeText={(text) => setSearchValue(text)} placeholder='Search' placeholderTextColor='#868686' style={{ fontSize: 13, fontWeight: '600', width: '80%', color: '#000' }} />
                    </View>
                    <TouchableOpacity onPress={() => {setSearchValue(''), setBooks([])}} style={{ borderLeftWidth: 1, borderLeftColor: '#cfcfcfd0', paddingLeft: 10 }}>
                        {searchValue.length > 0 && (
                            <Ionicons name={'close'} size={20} color={'#868686'} />
                        ) }
                    </TouchableOpacity>

                </View>
                <View style={{ marginTop: 20, height: height - 180 }}>
                    <FlatList data={books} keyExtractor={(books) => String(books.id)} showsVerticalScrollIndicator={false} 
                        renderItem={({ item }) => <BookItem bookData={item} />} 
                        getItemLayout={( item, index ) => ({
                            length: 90,
                            offset: 90 * index,
                            index
                        })}
                    />
                </View>
            </View>
        </View>
    )
}