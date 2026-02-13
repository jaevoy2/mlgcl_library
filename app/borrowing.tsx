import { FetchBorrowings } from "@/api/borrowings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Book = {
    id: number;
    title: string;
    description?: string;
    subtitle?: string;
    publication_year?: number;
}

type BookCopy = {
    id: number;
    book_id: number;
    book: Book;
}

type User = {
    id: number;
    name: string;
    email?: string;
}

type BookBorrowingProps = {
    id: number;
    book_copy_id: number;
    borrowed_at: string;
    returned_at: string | null;
    user_id: number;
    book_copy: BookCopy;
    user: User;
}

const { height, width } = Dimensions.get('screen')
const ITEMS_PER_PAGE = 5;

export default function BorrowingsView() {
    const [loading, setLoading] = useState(true);
    const [borrowings, setBorrowings] = useState<BookBorrowingProps[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBorrowing, setSelectedBorrowing] = useState<BookBorrowingProps | null>(null);

    
    useEffect(() => {
        handleFetchBorrowings();
    }, [])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery])


    const handleFetchBorrowings = async () => {
        try {
            const response = await FetchBorrowings();
    
            if(!response.error) {
                setBorrowings(response.data);
            } else {
                Alert.alert('Error', response.message);
            }
        } catch(error: any) {
            console.log('Fetch borrowings: ', error.message)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const handleCardPress = (borrowing: BookBorrowingProps) => {
        setSelectedBorrowing(borrowing);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedBorrowing(null);
    };

    const filteredBorrowings = borrowings.filter((borrowing) => {
        const bookTitle = borrowing.book_copy?.book?.title?.toLowerCase() || '';
        const userName = borrowing.user?.name?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        return bookTitle.includes(query) || userName.includes(query);
    });

    const totalPages = Math.ceil(filteredBorrowings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBorrowings = filteredBorrowings.slice(startIndex, endIndex);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const renderBorrowingItem = ({ item }: { item: BookBorrowingProps }) => (
        <TouchableOpacity 
            style={styles.borrowingCard}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.bookTitle} numberOfLines={2}>
                        {item.book_copy?.book?.title || 'Unknown Book'}
                    </Text>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                <View style={styles.userSection}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userInitial}>
                            {item.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>
                            {item.user?.name || 'Unknown User'}
                        </Text>
                        {item.user?.email && (
                            <Text style={styles.userEmail}>{item.user.email}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#27ae60" />
                    <Text style={styles.infoLabel}>Borrowed:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.borrowed_at)}</Text>
                </View>

                <View style={styles.tapHintContainer}>
                    <Text style={styles.tapHint}>Tap for details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#95a5a6" />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderModal = () => {
        if (!selectedBorrowing) return null;

        const book = selectedBorrowing.book_copy?.book;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Borrowing Details</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Ionicons name="close" size={28} color="#2c3e50" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalBody}
                            contentContainerStyle={styles.modalBodyContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Book Information */}
                            <View style={styles.modalSection}>
                                <View style={styles.sectionHeaderContainer}>
                                    <Ionicons name="book" size={24} color="#3498db" />
                                    <Text style={styles.sectionTitle}>Book Information</Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Title</Text>
                                    <Text style={styles.detailValue}>
                                        {book?.title || 'N/A'}
                                    </Text>
                                </View>

                                {book?.subtitle && (
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Subtitle</Text>
                                        <Text style={styles.detailValue}>{book.subtitle}</Text>
                                    </View>
                                )}

                                {book?.description && (
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Description</Text>
                                        <Text style={styles.detailValueDescription}>
                                            {book.description}
                                        </Text>
                                    </View>
                                )}

                                {book?.publication_year && (
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Published Year</Text>
                                        <Text style={styles.detailValue}>{book.publication_year}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Borrower Information */}
                            <View style={styles.modalSection}>
                                <View style={styles.sectionHeaderContainer}>
                                    <Ionicons name="person" size={24} color="#3498db" />
                                    <Text style={styles.sectionTitle}>Borrower Information</Text>
                                </View>

                                <View style={styles.borrowerCard}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.userInitial}>
                                            {selectedBorrowing.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalUserName}>
                                            {selectedBorrowing.user?.name || 'Unknown User'}
                                        </Text>
                                        {selectedBorrowing.user?.email && (
                                            <Text style={styles.modalUserEmail}>
                                                {selectedBorrowing.user.email}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Borrowing Information */}
                            <View style={styles.modalSection}>
                                <View style={styles.sectionHeaderContainer}>
                                    <Ionicons name="calendar" size={24} color="#3498db" />
                                    <Text style={styles.sectionTitle}>Borrowing Information</Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Borrowed Date</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDate(selectedBorrowing.borrowed_at)}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={styles.closeModalButton}
                                onPress={closeModal}
                            >
                                <Text style={styles.closeModalButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderPagination = () => {
        if (filteredBorrowings.length === 0) return null;

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity 
                    style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                    onPress={goToPreviousPage}
                    disabled={currentPage === 1}
                >
                    <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? "#bdc3c7" : "#3498db"} />
                    <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                        Previous
                    </Text>
                </TouchableOpacity>

                <View style={styles.pageIndicatorContainer}>
                    <Text style={styles.pageIndicatorText}>
                        {currentPage} / {totalPages}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                    onPress={goToNextPage}
                    disabled={currentPage === totalPages}
                >
                    <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                        Next
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? "#bdc3c7" : "#3498db"} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{ backgroundColor: '#fff', height }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3498db', height: 100, width, paddingTop: 40, paddingHorizontal: 20 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name={'arrow-back'} color={'#fff'} size={25} />
                </TouchableOpacity>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Borrowings</Text>
                <View style={{ width: 25 }} />
            </View>
            
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size={'large'} color={'#3498db'} />
                </View>
            ) : (
                <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 10 }}>
                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#7f8c8d" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by book title or user..."
                            placeholderTextColor="#95a5a6"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color="#95a5a6" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {filteredBorrowings.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="file-tray-outline" size={64} color="#a8a8a8" />
                            <Text style={{ color: '#a8a8a8', fontSize: 16, marginTop: 10 }}>
                                {searchQuery ? 'No borrowings found matching your search' : 'No borrowings found'}
                            </Text>
                            {searchQuery && (
                                <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                                    <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <>
                            <View style={styles.headerInfo}>
                                <Text style={styles.totalText}>
                                    {searchQuery 
                                        ? `Found: ${filteredBorrowings.length} borrowing${filteredBorrowings.length !== 1 ? 's' : ''}`
                                        : `Total: ${borrowings.length} borrowing${borrowings.length !== 1 ? 's' : ''}`
                                    }
                                </Text>
                                <Text style={styles.pageInfo}>
                                    Page {currentPage} of {totalPages}
                                </Text>
                            </View>

                            <FlatList
                                data={currentBorrowings}
                                renderItem={renderBorrowingItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                            />

                            {renderPagination()}
                        </>
                    )}
                </View>
            )}

            {renderModal()}
        </View>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2c3e50',
    },
    clearButton: {
        padding: 4,
    },
    clearSearchButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#3498db',
        borderRadius: 8,
    },
    clearSearchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    borrowingCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        gap: 12,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        gap: 10,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    userEmail: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
        minWidth: 80,
    },
    infoValue: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '600',
        flex: 1,
    },
    tapHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        marginTop: 4,
    },
    tapHint: {
        fontSize: 12,
        color: '#95a5a6',
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 4,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    totalText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    pageInfo: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    paginationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#3498db',
        gap: 6,
    },
    paginationButtonDisabled: {
        borderColor: '#bdc3c7',
        backgroundColor: '#ecf0f1',
    },
    paginationButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3498db',
    },
    paginationButtonTextDisabled: {
        color: '#bdc3c7',
    },
    pageIndicatorContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    pageIndicatorText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.9,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        flex: 1,
    },
    modalBodyContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    modalSection: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    detailItem: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    detailValue: {
        fontSize: 16,
        color: '#2c3e50',
        fontWeight: '500',
    },
    detailValueDescription: {
        fontSize: 15,
        color: '#2c3e50',
        lineHeight: 22,
    },
    borrowerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#e3f2fd',
        padding: 16,
        borderRadius: 12,
    },
    modalUserName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    modalUserEmail: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 4,
    },
    modalUserId: {
        fontSize: 12,
        color: '#95a5a6',
    },
    modalStatusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    modalStatusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    closeModalButton: {
        backgroundColor: '#3498db',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeModalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});