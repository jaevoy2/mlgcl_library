import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { FetchBorrowings } from "../api/borrowings";

type Book = {
  id: number;
  title: string;
  description?: string;
  subtitle?: string;
  publication_year?: number;
};

type BookCopy = {
  id: number;
  book_id: number;
  book: Book;
};

type User = {
  id: number;
  name: string;
  email?: string;
};

type BookBorrowingProps = {
  id: number;
  book_copy_id: number;
  borrowed_at: string;
  returned_at: string | null;
  book_copy: BookCopy;
  user_id: number;
  full_name: string;
  image_url?: string;
};

const { height, width } = Dimensions.get("screen");
const ITEMS_PER_PAGE = 5;

export default function BorrowingsView() {
  const [loading, setLoading] = useState(true);
  const [borrowings, setBorrowings] = useState<BookBorrowingProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] =
    useState<BookBorrowingProps | null>(null);

  useEffect(() => {
    handleFetchBorrowings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleFetchBorrowings = async () => {
    try {
      const response = await FetchBorrowings();

      if (!response.error) {
        setBorrowings(response.data);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      console.log("Fetch borrowings: ", error.message);
    } finally {
      setLoading(false);
      console.log(borrowings);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCardPress = (borrowing: BookBorrowingProps) => {
    setSelectedBorrowing(borrowing);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBorrowing(null);
  };

  const filteredBorrowings = borrowings.filter((borrowing) => {
    const bookTitle = borrowing.book_copy?.book?.title?.toLowerCase() || "";
    const userName = borrowing?.full_name?.toLowerCase() || "";
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
    setSearchQuery("");
  };

  const renderBorrowingItem = ({ item }: { item: BookBorrowingProps }) => (
    <TouchableOpacity
      style={styles.borrowingCard}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.book_copy?.book?.title || "Unknown Book"}
      </Text>

      <View style={styles.userSection}>
        <View style={styles.userAvatar}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} />
          ) : (
            <Text style={styles.userInitial}>
              {item?.full_name?.charAt(0).toUpperCase() || "U"}
            </Text>
          )}
        </View>
        <Text style={styles.userName}>{item.full_name || "Unknown User"}</Text>
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={18} color="#5DADE2" />
        <Text style={styles.dateLabel}>Borrowed:</Text>
        <Text style={styles.dateValue}>{formatDate(item.borrowed_at)}</Text>
      </View>

      <View style={styles.tapHintContainer}>
        <Text style={styles.tapHint}>Tap for details</Text>
        <Ionicons name="chevron-forward" size={16} color="#B0BEC5" />
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
              <Text style={styles.modalTitle}>Borrowed Book Details</Text>
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
                  <Text style={styles.detailValue}>{book?.title || "N/A"}</Text>
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
                    <Text style={styles.detailValue}>
                      {book.publication_year}
                    </Text>
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
                    {!selectedBorrowing.image_url ? (
                      <Text style={styles.userInitial}>
                        {selectedBorrowing.full_name.charAt(0).toUpperCase() ||
                          "U"}
                      </Text>
                    ) : (
                      <Image source={{ uri: selectedBorrowing.image_url }} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalUserName}>
                      {selectedBorrowing.full_name || "Unknown User"}
                    </Text>
                    {/* {selectedBorrowing.user?.email && (
                                            <Text style={styles.modalUserEmail}>
                                                {selectedBorrowing.user.email}
                                            </Text>
                                        )} */}
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
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage === 1 ? "#B0BEC5" : "#3498db"}
          />
          <Text
            style={[
              styles.paginationButtonText,
              currentPage === 1 && styles.paginationButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pageIndicatorContainer}>
          <Text style={styles.pageIndicatorText}>
            {currentPage} / {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            styles.paginationButtonNext,
            currentPage === totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={goToNextPage}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              styles.paginationButtonText,
              styles.paginationButtonNextText,
              currentPage === totalPages && styles.paginationButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentPage === totalPages ? "#B0BEC5" : "#fff"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name={"arrow-back"} color={"#fff"} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Borrowings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={"large"} color={"#3498db"} />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={22}
              color="#B0BEC5"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by book title or user..."
              placeholderTextColor="#B0BEC5"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={22} color="#B0BEC5" />
              </TouchableOpacity>
            )}
          </View>

          {filteredBorrowings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={64} color="#B0BEC5" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No borrowings found matching your search"
                  : "No borrowings found"}
              </Text>
              {searchQuery && (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.headerInfo}>
                <Text style={styles.totalText}>
                  {searchQuery
                    ? `Total: ${filteredBorrowings.length} borrowings`
                    : `Total: ${borrowings.length} borrowings`}
                </Text>
                <Text style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </Text>
              </View>

              <FlatList
                data={currentBorrowings}
                renderItem={renderBorrowingItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />

              {renderPagination()}
            </>
          )}
        </View>
      )}

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3498db",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#263238",
  },
  clearButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#B0BEC5",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  clearSearchButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3498db",
    borderRadius: 25,
  },
  clearSearchButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#607D8B",
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: "500",
    color: "#607D8B",
  },
  listContent: {
    paddingBottom: 20,
  },
  borrowingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#263238",
    marginBottom: 16,
    lineHeight: 26,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#E3F2FD",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  userInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#263238",
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 15,
    color: "#607D8B",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 15,
    color: "#263238",
    fontWeight: "500",
    flex: 1,
  },
  tapHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  tapHint: {
    fontSize: 13,
    color: "#B0BEC5",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 6,
    minWidth: 120,
    justifyContent: "center",
  },
  paginationButtonNext: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  paginationButtonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  paginationButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3498db",
  },
  paginationButtonNextText: {
    color: "#FFFFFF",
  },
  paginationButtonTextDisabled: {
    color: "#B0BEC5",
  },
  pageIndicatorContainer: {
    paddingVertical: 8,
  },
  pageIndicatorText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#263238",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.9,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7f8c8d",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  detailValueDescription: {
    fontSize: 15,
    color: "#2c3e50",
    lineHeight: 22,
  },
  borrowerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 12,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  closeModalButton: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
