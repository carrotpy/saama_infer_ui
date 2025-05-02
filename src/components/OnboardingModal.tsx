"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudyData } from "@/context/StudyDataContext";
import { useRouter } from "next/navigation";
import { fetchStudies } from "@/lib/api/study"; // ✅ Import the API call

export const OnboardingModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { setSelectedStudy, setOnboardingCompleted } = useStudyData();
    const [studies, setStudies] = useState<string[]>([]);
    const router = useRouter();

    const handleStudySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const study = e.target.value;
        if (study !== "Select existing study") {
            setSelectedStudy(study);
            setOnboardingCompleted(true);
            onClose();
        }
    };

    const handleNewStudy = () => {
        onClose();
        router.push("/onboard");
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
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="space-y-6 p-6 rounded-xl shadow-xl bg-white">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-800 text-center">
                        Select or Onboard Study
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={handleNewStudy}
                        className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        ➕ Onboard New Study
                    </button>

                    <select
                        className="w-full border px-3 py-2 rounded text-sm text-gray-700 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        defaultValue="Select existing study"
                        onChange={handleStudySelect}
                    >
                        <option disabled>Select existing study</option>
                        {studies.map((study) => (
                            <option key={study} value={study}>
                                {study}
                            </option>
                        ))}
                    </select>
                </div>
            </DialogContent>
        </Dialog>
    );
};