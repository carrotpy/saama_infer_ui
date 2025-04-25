"use client";

import { useState } from "react";
import { submitNewStudy } from "@/lib/api/study";
import { toast } from "sonner"; // if not already installed: npm install sonner

export default function OnboardPage() {
    const [form, setForm] = useState({
        study_name: "",
        therapeutic_area: "",
        indication: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };



    const handleSubmit = async () => {
        try {
            await submitNewStudy(form); // ⬅️ use imported API method
            toast.success("Study onboarded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Error submitting study.");
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl space-y-6 border">
                <h2 className="text-2xl font-semibold text-center text-blue-700">Onboard New Study</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Study Name</label>
                        <input
                            type="text"
                            name="study_name"
                            value={form.study_name}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Enter study name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Therapeutic Area</label>
                        <textarea
                            name="therapeutic_area"
                            value={form.therapeutic_area}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Describe therapeutic area"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Indication</label>
                        <textarea
                            name="indication"
                            value={form.indication}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Describe indication"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}