import React, { createContext, useContext, useState } from "react";


type BorrowProps = {
    bookCopyId: number;
    bookAuthor: string;
    bookTitle: string;
    bookSubtitle: string;
    bookPublished: string;
    availableCopies: number;
    borrowDate?: string;
    returnDate?: string;
    userId?: number;
    userName?: string;
    userCourse?: string;
    userYearLevel?: string;
    userImage?: string;
    hasScannedBook: boolean; 
}

type BorrowContextType = {
    borrowedBook: BorrowProps | null;
    setBorrowedBook: React.Dispatch<React.SetStateAction<BorrowProps>>;
    updateBorrowedBook: <K extends keyof BorrowProps> (
        key: K,
        value: BorrowProps[K]
    ) => void;
}

const BorrowedBookContext = createContext<BorrowContextType | undefined>(undefined);

export const BorrowedBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [borrowedBook, setBorrowedBook] = useState<BorrowProps | null>(null);

    const updateBorrowedBook = <K extends keyof BorrowProps> (
        key: K,
        value: BorrowProps[K]
    ) => setBorrowedBook((prev) => {
        if(!prev) return  null;

        return { ...prev, [key]: value };
    })

    return (
        <BorrowedBookContext.Provider value={{ borrowedBook, setBorrowedBook, updateBorrowedBook }}>
            { children }
        </BorrowedBookContext.Provider>
    )
}

export const useBorrowBook = () => {
    const context = useContext(BorrowedBookContext);

    if(!context) {
        throw new Error('useBorrowBook must be used within BorrowedBookProvider.')
    }

    return context;
}

