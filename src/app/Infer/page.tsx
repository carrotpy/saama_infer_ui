"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
    { id: 1, title: "Select Domain", content: "Choose a domain name." },
    { id: 2, title: "Additional Info", content: "Provide more details." },
    { id: 3, title: "Review & Submit", content: "Review your choices." },
];

export default function InferenceUI() {
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < cards.length - 1) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="text-center mb-6">
                <img src="/logo.png" alt="Logo" className="mx-auto w-16 h-16 mb-2" />
                <h2 className="text-3xl font-bold text-gray-700">Welcome to the Inference UI</h2>
            </div>
            <Card className="w-[32rem] h-[40rem] p-8 shadow-lg rounded-2xl bg-white border border-gray-300 flex flex-col justify-between">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-700">{cards[step].title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600 flex-grow">
                    <p className="mb-6 text-lg">{cards[step].content}</p>
                </CardContent>
                <div className="flex justify-between mt-6">
                    {step > 0 && <Button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md" onClick={handleBack}>Back</Button>}
                    <Button
                        className={`px-6 py-3 rounded-md ${step === cards.length - 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                        onClick={handleNext}
                        disabled={step === cards.length - 1}
                    >
                        Next
                    </Button>
                </div>
            </Card>
        </div>
    );
}
