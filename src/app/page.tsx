"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import yaml from "js-yaml";
import axios from "axios";

const domains: string[] = ["ae", "cm", "dm"];
const combinations: string[] = ["ae|cm", "cm|dm", "ae", "cm", "dm", "ae|dm"];

const InferenceUI: React.FC = () => {
    const [step, setStep] = useState<number>(0);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);
    const [textConfig, setTextConfig] = useState<{ [key: string]: string }>({});
    const [editableTexts, setEditableTexts] = useState<{ [key: string]: string }>({});
    const [selectedCombination, setSelectedCombination] = useState<string | null>(null);
    const [fileUploads, setFileUploads] = useState<{ [key: string]: File | null }>({});
    const formData = new FormData();
    const [status, setStatus] = useState<string>("pending");
    const [polling, setPolling] = useState<boolean>(false);
    const [studyInfo, setStudyInfo] = useState<string>("");
    const [indication, setIndication] = useState<string>("");
    const study_info: Record<string, string> = {};


    const checkStatus = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/get_status");
            setStatus(response.data.status);

            if (response.data.status === "completed") {
                setPolling(false); // Stop polling when completed
            }
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    };



    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (polling) {
            interval = setInterval(() => {
                checkStatus();
            }, 5000); // Poll every 5 seconds
        }

        return () => clearInterval(interval);
    }, [polling]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, domain: string) => {
        const files = event.target.files;

        if (files?.length) {
            setFileUploads((prev) => ({
                ...prev,
                [domain]: files[0],
            }));
        }
    };



    useEffect(() => {
        // Simulated YAML file (Replace this with API call if needed)
        const yamlData = `
      ae: "AE default text"
      cm: "CM default text"
      dm: "DM default text"
      ae|cm: "AE-CM combined text"
      cm|dm: "CM-DM combined text"
      ae|dm: "AE-DM combined text"
    `;

        const parsedYaml = yaml.load(yamlData) as { [key: string]: string };
        setTextConfig(parsedYaml);
    }, []);

    const handleDomainSelect = (domain: string): void => {
        setSelectedDomains((prev) =>
            prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
        );
    };

    const isCombinationVisible = (combo: string): boolean => {
        const comboParts: string[] = combo.split('|');
        return comboParts.every((part) => selectedDomains.includes(part));
    };



    const handleNext = async (): Promise<void> => {
        if (step === 0) {
            // Move to step 2 and save the selected combinations
            const visibleCombinations = combinations.filter(isCombinationVisible);
            setSelectedCombinations(visibleCombinations);

            // Store selected domains in FormData


            // Set initial text values for each selected combination
            const initialTexts = visibleCombinations.reduce((acc, combo) => {
                acc[combo] = textConfig[combo] || "";
                return acc;
            }, {} as { [key: string]: string });
            setEditableTexts(initialTexts);

            // Automatically select the first combination
            if (visibleCombinations.length > 0) {
                setSelectedCombination(visibleCombinations[0]);
                console.log("Step 0 - Form Data (selected domain):");
                for (const pair of formData.entries()) {
                    console.log(`${pair[0]}: ${pair[1]}`);
                }
            }
        }  else if (step === 3) {
            // selectedCombinations.forEach((combo) => {
            //   formData.set(combo, editableTexts[combo] || "");
            // });
            formData.set("selectedDomains", JSON.stringify(selectedDomains));
            formData.set("selectedCombination", JSON.stringify(selectedCombinations));
            formData.set("CombinationValues", JSON.stringify(editableTexts));
            // Store uploaded files in FormData
            selectedDomains.forEach((domain) => {
                if (fileUploads[domain]) {
                    formData.append("files", fileUploads[domain] as File);
                }
            });
            study_info['indication'] = indication;
            study_info['studyInfo'] = studyInfo;

            formData.set("study_info", JSON.stringify(study_info));


            console.log("Final Form Data Before Submission:");
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }


            try {
                const response = await axios.post("http://127.0.0.1:8000/api/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.status === 200) {
                    alert("All data submitted successfully!");
                    setStep(4); // Move to Step 4
                    setPolling(true); // Start polling for status
                } else {
                    alert("Failed to submit data.");
                }
            } catch (error) {
                console.error("Error submitting data:", error);
                alert("Error submitting data.");
            }
        }

        if (step < 3) {
            setStep(step + 1);
        }
    };
    const handleBack = (): void => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleCombinationSelect = (combo: string): void => {
        setSelectedCombination(combo);
    };

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditableTexts((prev) => ({
            ...prev,
            [selectedCombination!]: event.target.value,
        }));
    };

    const handleSaveText = () => {
        if (selectedCombination) {
            setTextConfig((prevConfig) => ({
                ...prevConfig,
                [selectedCombination]: editableTexts[selectedCombination],
            }));
            alert(`Text for ${selectedCombination.toUpperCase()} saved successfully!`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-gray-900">
            <div className="text-center mb-6">
                <img src="https://www.saama.com/wp-content/uploads/saama_logo.svg" alt="Logo" className="mx-auto w-20 h-20 mb-4" />
                <h2 className="text-3xl font-bold text-blue-700">Welcome to the Inference UI</h2>
            </div>
            <Card className="w-[40rem] h-[44rem] p-8 shadow-xl rounded-3xl bg-white border border-blue-300 flex flex-col justify-between">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-semibold text-blue-800">
                        {step === 0 ? "Select Domains & View Combinations" : "Edit Selected Combination"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-700 flex-grow">
                    {/* Step 1: Select Domains & View Available Combinations */}
                    {step === 0 && (
                        <>
                            <div className="mb-6">
                                <label className="block text-lg font-medium text-blue-700">Select Domains:</label>
                                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                                    {domains.map((domain) => (
                                        <button
                                            key={domain}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                                selectedDomains.includes(domain) ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-300"
                                            }`}
                                            onClick={() => handleDomainSelect(domain)}
                                        >
                                            {domain.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Available Combinations */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-blue-700">Available Combinations:</h3>
                                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                                    {combinations.map((combo) => (
                                        <span
                                            key={combo}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                                isCombinationVisible(combo) ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
                                            }`}
                                        >
                      {combo.toUpperCase()}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Edit Text for Selected Combination */}
                    {step === 1 && selectedCombinations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-blue-700">Selected Combinations:</h3>
                            <div className="flex flex-wrap gap-3 mt-3 justify-center">
                                {selectedCombinations.map((combo) => (
                                    <button
                                        key={combo}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                            selectedCombination === combo ? "bg-blue-700 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                                        }`}
                                        onClick={() => handleCombinationSelect(combo)}
                                    >
                                        {combo.toUpperCase()}
                                    </button>

                                ))}
                            </div>

                            {/* Single Editable Text Field */}
                            {selectedCombination && (
                                <div className="mt-6">
                                    <label className="block text-lg font-medium text-blue-700">
                                        Edit Text for {selectedCombination.toUpperCase()}:
                                    </label>
                                    <textarea
                                        className="w-full h-24 mt-3 p-3 border border-gray-300 rounded-lg"
                                        value={editableTexts[selectedCombination]}
                                        onChange={handleTextChange}
                                    />
                                    <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg" onClick={handleSaveText}>
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {step === 3 && (
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-blue-700">Upload Files for Each Domain:</h3>
                            <div className="flex flex-col items-center gap-4 mt-4">
                                {selectedDomains.map((domain) => (
                                    <div key={domain} className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-between">
                                        <span className="font-semibold text-blue-700">{domain.toUpperCase()} *</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            id={`file-upload-${domain}`}
                                            required={true}
                                            onChange={(e) => handleFileChange(e, domain)
                                            }
                                        />
                                        <label
                                            htmlFor={`file-upload-${domain}`}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                                        >
                                            {fileUploads[domain] ? fileUploads[domain]?.name : "Choose File"}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6">
                                {Object.values(fileUploads).some(file => file !== null) && (
                                    <Button
                                        className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={handleNext}>
                                        Submit Files
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-blue-700">Study Details</h3>

                            {/* Study Info Text Box */}
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700">Study Info</label>
                                <textarea
                                    className="w-full h-24 mt-1 p-3 border border-gray-300 rounded-lg"
                                    value={studyInfo}
                                    onChange={(e) => setStudyInfo(e.target.value)}
                                />
                            </div>

                            {/* Indication Text Box */}
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700">Indication</label>
                                <textarea
                                    className="w-full h-24 mt-1 p-3 border border-gray-300 rounded-lg"
                                    value={indication}
                                    onChange={(e) => setIndication(e.target.value)}
                                />
                            </div>


                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-gray-900">
                            <h2 className="text-4xl font-bold text-blue-700">Processing Status</h2>

                            <Card className="w-[36rem] p-8 mt-6 shadow-xl rounded-3xl bg-white border border-blue-300 flex flex-col items-center">
                                <h3 className="text-2xl font-medium text-blue-800 mb-4">Current Status</h3>

                                {status === "completed" ? (
                                    <span className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold text-lg">
          ✅ Process Completed
        </span>
                                ) : (
                                    <span className="px-6 py-3 rounded-lg bg-yellow-500 text-white font-semibold text-lg">
          ⏳ {status.toUpperCase()}
        </span>
                                )}

                                {status !== "completed" && (
                                    <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-4 border-blue-700"></div>
                                )}
                            </Card>
                        </div>
                    )}
                </CardContent>
                <div className="flex justify-between mt-6">
                    {step <3 && (
                        <Button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg" onClick={handleBack}>
                            Back
                        </Button>
                    )}

                    {step<3 && (
                        <Button
                            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleNext}
                        >
                            {step === 1 ? "Save & Submit" : "Next"}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default InferenceUI;