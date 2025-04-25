"use client";

import { createContext, useContext, ReactNode } from "react";
import { useEffect, useState } from "react";

type ParsedSheet = {
    name: string;
    data: any[][]; // Array of rows (each row is an array of values)
};

type StudyDataContextType = {
    selectedStudy: string | null;
    setSelectedStudy: (study: string) => void;
    sheetNames: string[];
    setSheetNames: (names: string[]) => void;
    parsedSheets: ParsedSheet[];
    setParsedSheets: (sheets: ParsedSheet[]) => void;
    onboardingCompleted: boolean;
    setOnboardingCompleted: (val: boolean) => void;
};

const StudyDataContext = createContext<StudyDataContextType | undefined>(undefined);

export const StudyDataProvider = ({ children }: { children: ReactNode }) => {

    const [selectedStudy, setSelectedStudyState] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(false);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([]);

    useEffect(() => {
        const storedStudy = sessionStorage.getItem("selectedStudy");
        const storedOnboarding = sessionStorage.getItem("onboardingCompleted");

        if (storedStudy) setSelectedStudyState(storedStudy);
        if (storedOnboarding === "true") setOnboardingCompletedState(true);
    }, []);

    // Sync state to sessionStorage
    const setSelectedStudy = (study: string) => {
        setSelectedStudyState(study);
        sessionStorage.setItem("selectedStudy", study);
    };

    const setOnboardingCompleted = (value: boolean) => {
        setOnboardingCompletedState(value);
        sessionStorage.setItem("onboardingCompleted", value.toString());
    };


    return (
        <StudyDataContext.Provider
            value={{
                selectedStudy,
                setSelectedStudy,
                sheetNames,
                setSheetNames,
                parsedSheets,
                setParsedSheets,
                onboardingCompleted,
                setOnboardingCompleted,
            }}
        >
            {children}
        </StudyDataContext.Provider>
    );
};

export const useStudyData = () => {
    const ctx = useContext(StudyDataContext);
    if (!ctx) throw new Error("useStudyData must be used inside StudyDataProvider");
    return ctx;
};