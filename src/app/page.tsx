"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid"; // Import UUID library
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import axios from "axios";
import {FiUpload, FiCheckCircle, FiDownload} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { motion } from "framer-motion";

const domains: string[] = ['AE', 'CM', 'EX', 'MH', 'LB', 'VS', 'DD', 'DS', 'DM', 'DV', 'IE', 'SV','EC', 'PR', 'EG', 'MB', 'MI', 'MK', 'CE', 'NV', 'OE','TU','TR'];
const combinations: string[] = ["AE|CM", "CM|DM", "AE", "CM", "DM", "AE|DM"];
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const InferenceUI: React.FC = () => {
    const [step, setStep] = useState<number>(0);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);
    // const [textConfig, setTextConfig] = useState<{ [key: string]: string }>({});
    // const [editableTexts, setEditableTexts] = useState<{ [key: string]: string }>({});
    // const [selectedCombination, setSelectedCombination] = useState<string | null>(null);
    const [fileUploads, setFileUploads] = useState<{ [key: string]: File | null }>({});
    const [sessionId] = useState<string>(uuidv4()); // ✅ Generate a new session ID on every refresh
    const [windowOpened] = useState<boolean>(false);

    const formData = new FormData();
    const [downloadFiles, setdownloadFiles] = useState<string[]>([]);
    const [status, setStatus] = useState<string>("pending");
    const [polling, setPolling] = useState<boolean>(false);
    const [studyInfo, setStudyInfo] = useState<string>("");
    const [indication, setIndication] = useState<string>("");
    const study_info: Record<string, string> = {};
     // Default for local development

    console.log("Base URL:", BASE_URL);


    const checkStatus = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/get_status?sessionId=${sessionId}`,{
                headers: {
                    "ngrok-skip-browser-warning": "69420"
                }
            });
            const currentStatus = response.data.status.toLowerCase();
            setStatus(currentStatus);
            console.log("currentStatus", currentStatus, !windowOpened);
            console.log(downloadFiles.length,downloadFiles)

            if (currentStatus.includes("completed") && !windowOpened) {
                fetchFiles();
            }

            if (currentStatus === "end") {
                setPolling(false); // ✅ Stop polling when "end" is returned
            }
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    };
    useEffect(() => {
        console.log("Updated Download Files:", downloadFiles); // ✅ Logs when `downloadFiles` changes
    }, [downloadFiles]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/get_files?sessionId=${sessionId}`,{
                headers: {
                    "ngrok-skip-browser-warning": "69420"
                }
            });

            console.log("API Response:", response.data); // ✅ Log response

            if (response.data && Array.isArray(response.data)) {
                console.log("Previous State:", downloadFiles); // ✅ Log current state before update

                setdownloadFiles((prevFiles) => {
                    console.log("Previous Files:", prevFiles); // Debugging line
                    console.log("New Files:", response.data); // Debugging line

                    return [...response.data]; // ✅ Ensure state updates properly
                });// ✅ Spread operator forces state update

                console.log("Updated State:", downloadFiles); // ✅ Log new state (this may not immediately show changes)
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };



    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (polling) {
            interval = setInterval(() => {
                checkStatus();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [polling, windowOpened]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, domain: string) => {
        const files = event.target.files;

        if (files?.length) {
            setFileUploads((prev) => ({
                ...prev,
                [domain]: files[0],
            }));
        }
    };





    // useEffect(() => {
    //     // Simulated YAML file
    //     const yamlData = `
    //   ae: "AE default text"
    //   cm: "CM default text"
    //   dm: "DM default text"
    //   ae|cm: "AE-CM combined text"
    //   cm|dm: "CM-DM combined text"
    //   ae|dm: "AE-DM combined text"
    // `;
    //     const parsedYaml = yaml.load(yamlData) as { [key: string]: string };
    //     setTextConfig(parsedYaml);
    // }, []);

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
            // const initialTexts = visibleCombinations.reduce((acc, combo) => {
            //     acc[combo] = textConfig[combo] || "";
            //     return acc;
            // }, {} as { [key: string]: string });
            // setEditableTexts(initialTexts);

            // Automatically select the first combination
            // if (visibleCombinations.length > 0) {
            //     setSelectedCombination(visibleCombinations[0]);
            //     console.log("Step 0 - Form Data (selected domain):");
            //     for (const pair of formData.entries()) {
            //         console.log(`${pair[0]}: ${pair[1]}`);
            //     }
            // }
        }  else if (step === 2) {
            // selectedCombinations.forEach((combo) => {
            //   formData.set(combo, editableTexts[combo] || "");
            // });
            formData.set("sessionId", sessionId);
            formData.set("selectedDomains", JSON.stringify(selectedDomains));
            formData.set("selectedCombination", JSON.stringify(selectedCombinations));
            // formData.set("CombinationValues", JSON.stringify(editableTexts));
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
                const response = await axios.post(BASE_URL+"/api/get_input_data", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.status === 200) {
                    alert("All data submitted successfully!");
                    setStep(3); // Move to Step 4
                    setPolling(true); // Start polling for status
                    return;
                } else {
                    alert("Failed to submit data.");
                }
            } catch (error) {
                console.error("Error submitting data:", error);
                alert("Error submitting data.");
                return;
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

    // const handleCombinationSelect = (combo: string): void => {
    //     setSelectedCombination(combo);
    // };
    //
    // const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     setEditableTexts((prev) => ({
    //         ...prev,
    //         [selectedCombination!]: event.target.value,
    //     }));
    // };
    //
    // const handleSaveText = () => {
    //     if (selectedCombination) {
    //         setTextConfig((prevConfig) => ({
    //             ...prevConfig,
    //             [selectedCombination]: editableTexts[selectedCombination],
    //         }));
    //         alert(`Text for ${selectedCombination.toUpperCase()} saved successfully!`);
    //     }
    // };
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
            {/* Header Section */}
            <header className="w-full bg-white shadow-md border-b border-gray-300 p-4 flex items-center">
                <img
                    src="https://www.saama.com/wp-content/uploads/saama_logo.svg"
                    alt="Logo"
                    className="w-20 h-20"
                />
                <h1 className="ml-4 text-xl font-semibold text-gray-800 text-center">
                    |
                </h1>
                <h1 className="ml-4 text-xl font-semibold text-gray-800 text-center">
                    QAD - Inference
                </h1>
            </header>

            {/* Card Container */}
            <main className="flex flex-col items-center justify-around flex-grow p-8">
            <Tabs defaultValue="account" className="flex flex-col  border-gray-300">
                    <TabsList className="grid w-full grid-cols-2 ">
                        <TabsTrigger  value="account">Inference</TabsTrigger>
                        <TabsTrigger value="password">Result</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">

                <Card className=" flex flex-col justify-around w-[50rem]  h-auto p-8 shadow-lg rounded-xl bg-white border border-gray-300">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-semibold text-gray-800">
                            {step === 0 ? "Select Domains & Combinations" : step=== 1? "Provide the Study Info":step=== 2? "Upload the Domain File":"Results" }</CardTitle>
                    </CardHeader>

                <CardContent className="text-center text-gray-700 space-y-6">
                    {/* Step 1: Select Domains */}
                    {step === 0 && (
                        <>
                            <div>
                                <h3 className="text-lg font-medium text-gray-700">Select Domains</h3>
                                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                                    {domains.map((domain) => (
                                        <button
                                            key={domain}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200
                                            ${
                                                selectedDomains.includes(domain)
                                                    ? "bg-blue-600 text-white shadow-md"
                                                    : "bg-gray-200 text-gray-700 hover:bg-blue-400"
                                            }`}
                                            onClick={() => handleDomainSelect(domain)}
                                        >
                                            {domain.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Available Combinations */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-700">Available Combinations</h3>
                                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                                    {combinations.map((combo) => (
                                        <span
                                            key={combo}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200
                                            ${
                                                isCombinationVisible(combo)
                                                    ? "bg-blue-600 text-white shadow-md"
                                                    : "bg-gray-300 text-gray-700"
                                            }`}
                                        >
                                            {combo.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/*/!* Step 2: Edit Text for Selected Combination *!/*/}
                    {/*{step === 1 && selectedCombinations.length > 0 && (*/}
                    {/*    <div>*/}
                    {/*        <h3 className="text-lg font-medium text-blue-700">Selected Combinations:</h3>*/}
                    {/*        <div className="flex flex-wrap gap-3 mt-3 justify-center">*/}
                    {/*            {selectedCombinations.map((combo) => (*/}
                    {/*                <button*/}
                    {/*                    key={combo}*/}
                    {/*                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${*/}
                    {/*                        selectedCombination === combo ? "bg-blue-700 text-white" : "bg-blue-500 text-white hover:bg-blue-600"*/}
                    {/*                    }`}*/}
                    {/*                    onClick={() => handleCombinationSelect(combo)}*/}
                    {/*                >*/}
                    {/*                    {combo.toUpperCase()}*/}
                    {/*                </button>*/}

                    {/*            ))}*/}
                    {/*        </div>*/}

                    {/*        /!* Single Editable Text Field *!/*/}
                    {/*        {selectedCombination && (*/}
                    {/*            <div className="mt-6">*/}
                    {/*                <label className="block text-lg font-medium text-blue-700">*/}
                    {/*                    Edit Text for {selectedCombination.toUpperCase()}:*/}
                    {/*                </label>*/}
                    {/*                <textarea*/}
                    {/*                    className="w-full h-24 mt-3 p-3 border border-gray-300 rounded-lg"*/}
                    {/*                    value={editableTexts[selectedCombination]}*/}
                    {/*                    onChange={handleTextChange}*/}
                    {/*                />*/}
                    {/*                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg" onClick={handleSaveText}>*/}
                    {/*                    Save*/}
                    {/*                </Button>*/}
                    {/*            </div>*/}
                    {/*        )}*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Step 2: Upload Files */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {/*<h3 className="text-lg font-medium text-gray-700">Upload Files for Domains</h3>*/}

                            {selectedDomains.map((domain) => (
                                <div key={domain}
                                     className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                                    <span className="font-semibold text-blue-700">{domain.toUpperCase()}</span>
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
                                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600">
                                        <FiUpload className="text-lg"/>
                                        {fileUploads[domain] ? fileUploads[domain]?.name : "Choose File"}
                                    </label>
                                </div>
                            ))}

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
                    {step === 1 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-blue-700">Study Details</h3>

                            {/* Study Info Text Box */}
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700">Therapeutic Area</label>
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
                    {step === 3 && (
                        <motion.div className="text-center" initial={{opacity: 0, scale: 0.9}}
                                    animate={{opacity: 1, scale: 1}} transition={{duration: 0.5, ease: "easeOut"}}>
                            <h3 className="text-2xl font-semibold text-gray-800">Processing Status</h3>
                            <motion.div className="mt-6 flex flex-col items-center" initial={{opacity: 0, y: -10}}
                                        animate={{opacity: 1, y: 0}} transition={{duration: 0.8, ease: "easeOut"}}>
                                {status.toLowerCase().includes("end") ? (
                                    <>
                                        <motion.span
                                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold text-lg shadow-md">
                                            <FiCheckCircle className="text-2xl animate-pulse"/> Process Completed -
                                            Fetching Files
                                        </motion.span>
                                        {/*<DownloadFiles/>*/}
                                    </>
                                ) : (
                                    <motion.span
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-white font-semibold text-lg shadow-md">
                                        <AiOutlineLoading3Quarters
                                            className="animate-spin text-2xl"/> {status.toUpperCase()}
                                    </motion.span>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/*{step === 3 && (*/}
                    {/*    <motion.div*/}
                    {/*        className="text-center"*/}
                    {/*        initial={{ opacity: 0, scale: 0.9 }} // Smooth entrance*/}
                    {/*        animate={{ opacity: 1, scale: 1 }}*/}
                    {/*        transition={{ duration: 0.5, ease: "easeOut" }} // Easing animation*/}
                    {/*    >*/}
                    {/*        <h3 className="text-2xl font-semibold text-gray-800">Processing Status</h3>*/}
                    {/*        <motion.div*/}
                    {/*            className="mt-6 flex flex-col items-center"*/}
                    {/*            initial={{ opacity: 0, y: -10 }}*/}
                    {/*            animate={{ opacity: 1, y: 0 }}*/}
                    {/*            transition={{ duration: 0.8, ease: "easeOut" }}*/}
                    {/*        >*/}
                    {/*            {status === "completed" ? (*/}
                    {/*                <motion.span*/}
                    {/*                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold text-lg shadow-md"*/}
                    {/*                    initial={{ scale: 0.8 }}*/}
                    {/*                    animate={{ scale: 1.1 }}*/}
                    {/*                    transition={{*/}
                    {/*                        type: "spring",*/}
                    {/*                        stiffness: 200,*/}
                    {/*                        damping: 10,*/}
                    {/*                        repeat: Infinity,*/}
                    {/*                        repeatType: "reverse",*/}
                    {/*                    }} // Pulsating effect*/}
                    {/*                >*/}
                    {/*                    <FiCheckCircle className="text-2xl animate-pulse" /> Process Completed*/}
                    {/*                </motion.span>*/}
                    {/*            ) : (*/}
                    {/*                <motion.span*/}
                    {/*                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-white font-semibold text-lg shadow-md"*/}
                    {/*                    initial={{ scale: 1 }}*/}
                    {/*                    animate={{ scale: 1.1 }}*/}
                    {/*                    transition={{*/}
                    {/*                        type: "spring",*/}
                    {/*                        stiffness: 150,*/}
                    {/*                        damping: 8,*/}
                    {/*                        repeat: Infinity,*/}
                    {/*                        repeatType: "reverse",*/}
                    {/*                    }} // Pulsating effect for loading*/}
                    {/*                >*/}
                    {/*                    <AiOutlineLoading3Quarters className="animate-spin text-2xl" /> {status.toUpperCase()}*/}
                    {/*                </motion.span>*/}
                    {/*            )}*/}
                    {/*        </motion.div>*/}
                    {/*    </motion.div>*/}
                    {/*)}*/}
                </CardContent>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        {step > 0 && step < 2 && (
                            <Button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
                                    onClick={handleBack}>
                                Back
                            </Button>
                        )}
                        {step < 2 &&   (
                            <Button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white "
                                     onClick={selectedDomains.length > 0 ? handleNext:()=>{}} >


                                Next
                            </Button>
                        )}
                    </div>
                </Card>
                    </TabsContent>
                    </Tabs>
            </main>
            {status.toLowerCase().includes("completed")&& (
                <aside className="w-1/2 bg-white shadow-lg p-4 border-l border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Downloadable Files</h3>
                    {downloadFiles.length === 0 ? (
                        <p className="text-gray-600">Fetching files...</p>
                    ) : (
                        <ul className="space-y-2">
                            {downloadFiles.map((file, index) => (
                                file !== "END" && (
                                    <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow">
                                        <span className="text-gray-800">{file}</span>
                                        <a
                                            href={`${BASE_URL}/download/${sessionId}/${file}`}
                                            download
                                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                                        >
                                            <FiDownload className="text-lg" /> Download
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    )}
                </aside>
            )}
        </div>
    );
};

export default InferenceUI;