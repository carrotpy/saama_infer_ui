"use client";

import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useStudyData } from "@/context/StudyDataContext";
import { OnboardingModal } from "@/components/OnboardingModal";
import { toast } from "sonner"; // If not installed: npm install sonner

export default function HomePage() {
    // const { selectedStudy, setSelectedStudy } = useStudyData();
    const { onboardingCompleted, selectedStudy } = useStudyData();
    const [showModal, setShowModal] = useState<boolean>(true);

    useEffect(() => {
        if (selectedStudy) {
            setShowModal(false);
        }
    }, [selectedStudy]);
    useEffect(() => {
        if (!onboardingCompleted || !selectedStudy) {
            setShowModal(true);
        }
    }, [onboardingCompleted, selectedStudy]);
    const { setSheetNames, setParsedSheets } = useStudyData();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });

            const parsedSheets = workbook.SheetNames.map((name) => ({
                name,
                data: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }),
            }));

            setParsedSheets(parsedSheets);
            setSheetNames(workbook.SheetNames);

            toast.success("Excel file uploaded and parsed successfully!");
        } catch (error) {
            console.error("Error parsing Excel:", error);
            toast.error("Failed to read Excel file.");
        }
    };

    return (

        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">Upload Study Excel File</h2>

                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                    <div className="text-left">
                        <h3 className="text-lg font-medium text-blue-700">Select Excel File</h3>
                        <p className="text-sm text-gray-600">
                            Only .xlsx or .xls files are allowed &nbsp;
                            <a href="/samples/sample.xlsx" download className="text-blue-600 hover:underline">
                                Download Sample
                            </a>
                        </p>
                    </div>

                    <div>
                        <input
                            type="file"
                            id="excel-upload"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <label
                            htmlFor="excel-upload"
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                        >
                            <FiUpload className="text-lg" />
                            {selectedFile ? selectedFile.name : "Choose Excel File"}
                        </label>
                    </div>
                </div>
            </div>
            <OnboardingModal open={showModal} onClose={() => setShowModal(false)} />
        </div>

    );
}