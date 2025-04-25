"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudyData } from "@/context/StudyDataContext";
import { useRouter } from "next/navigation";

export const OnboardingModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { setSelectedStudy, setOnboardingCompleted } = useStudyData();
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
        onClose(); // Optional: close modal before routing
        router.push("/onboard");
    };

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
                        <option>Study A</option>
                        <option>Study B</option>
                        <option>Study C</option>
                    </select>
                </div>
            </DialogContent>
        </Dialog>
    );
};