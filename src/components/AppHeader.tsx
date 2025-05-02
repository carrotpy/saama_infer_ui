"use client";

import { useEffect, useState } from "react";
import { useStudyData } from "@/context/StudyDataContext";
import { useRouter } from "next/navigation";
import { fetchStudies } from "@/lib/api/study"; // ✅ import your new API call
import { FiLogOut } from "react-icons/fi";

export const AppHeader = () => {
    const { selectedStudy, setSelectedStudy, setOnboardingCompleted } = useStudyData();
    const [studies, setStudies] = useState<string[]>([]);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStudy(e.target.value);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        setSelectedStudy('');
        setOnboardingCompleted(false);
        router.push("/");
    };

    useEffect(() => {
        const loadStudies = async () => {
            try {
                const fetchedStudies = await fetchStudies();
                setStudies(fetchedStudies);
            } catch (error) {
                console.error("Failed to load studies:", error);
            }
        };
        loadStudies();
    }, []);

    return (
        <header className="w-full bg-white shadow-md border-b border-gray-300 p-4 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center">
                <img
                    src="https://www.saama.com/wp-content/uploads/saama_logo.svg"
                    alt="Logo"
                    className="w-13 h-9"
                />
                <h1 className="ml-4 text-xl font-semibold text-gray-800">|</h1>
                <h1 className="ml-4 text-xl font-semibold text-gray-800">QAD - Inference</h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <label htmlFor="study-select" className="text-sm text-gray-700 font-medium">
                        Select Study:
                    </label>
                    <select
                        id="study-select"
                        value={selectedStudy || ""}
                        onChange={handleChange}
                        className="border rounded px-3 py-1 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                    >
                        <option disabled value="">
                            Select study
                        </option>
                        {studies.map((study) => (
                            <option key={study} value={study}>
                                {study}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-600 border border-red-500 px-3 py-1 rounded hover:bg-red-100 transition"
                >
                    <FiLogOut className="text-lg" />
                    Logout
                </button>
            </div>
        </header>
    );
};