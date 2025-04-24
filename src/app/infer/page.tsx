"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid"; // Import UUID library
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import axios from "axios";
import {FiUpload, FiCheckCircle, FiDownload, FiRefreshCw} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { motion } from "framer-motion";

const domains: string[] = ['AE', 'CE', 'CM', 'DM', 'DS', 'DV', 'EC', 'EG', 'EX', 'IE', 'LB', 'MB', 'MH', 'MI', 'MK', 'NV', 'OE', 'PE', 'TR', 'TU', 'VS' , 'PR'];
const combinations: string[] = ['AE|CM', 'AE|DM', 'AE|EG', 'AE|LB', 'AE|MB', 'AE|MH', 'AE|MI', 'AE|MK', 'AE|NV', 'AE|OE', 'AE|PE', 'AE|VS', 'CE|CM', 'CE|DM', 'CE|EG', 'CE|LB', 'CE|MB', 'CE|MH', 'CE|MI', 'CE|MK', 'CE|NV', 'CE|OE', 'CE|PE', 'CE|VS', 'CM|MB', 'CM|MH', 'CM|MI', 'CM|MK', 'CM|NV', 'CM|OE', 'DV|IE', 'EG|MH', 'MB|MH', 'MH|MI', 'MH|MK', 'MH|NV', 'MH|OE', 'MH|PE', 'AE', 'CE', 'CM', 'DM', 'DS', 'DV', 'EC', 'EG', 'EX', 'IE', 'LB', 'MB', 'MH', 'MI', 'MK', 'NV', 'OE', 'PE', 'TR', 'TU', 'VS','PR'];
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const InferenceUI: React.FC = () => {
    const [step, setStep] = useState<number>(0);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);
    const [sheetNames, setSheetNames] =useState<string[]>([]);
    // const [textConfig, setTextConfig] = useState<{ [key: string]: string }>({});
    // const [editableTexts, setEditableTexts] = useState<{ [key: string]: string }>({});
    // const [selectedCombination, setSelectedCombination] = useState<string | null>(null);
    const [fileUploads, setFileUploads] = useState<{ [key: string]: File | null }>({});
    const [sessionId] = useState<string>(uuidv4()); // ✅ Generate a new session ID on every refresh
    const [windowOpened] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    // const [showSettings, setShowSettings] = useState(false);
    // const [settingsData, setSettingsData] = useState<{ [key: string]: string }>({});
    // const [currentKey, setCurrentKey] = useState("");
    // const [currentValue, setCurrentValue] = useState("");

    const formData = new FormData();
    const [downloadFiles, setdownloadFiles] = useState<string[]>([]);
    const [status, setStatus] = useState<string>("pending");
    const [polling, setPolling] = useState<boolean>(false);
    const [studyInfo, setStudyInfo] = useState<string>("");
    const [indication, setIndication] = useState<string>("");
    const study_info: Record<string, string> = {};
    // Default for local development

    console.log("Base URL:", BASE_URL);

    const readExcelFile = async (file:File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (!result || !(result instanceof ArrayBuffer)) {
                console.error("Invalid file data");
                return;
            }
            const data = new Uint8Array(result);
            const workbook = XLSX.read(data, { type: "array" });
            const extractedSheetNames = workbook.SheetNames;
            setSheetNames(extractedSheetNames); // Set sheet names in state
            const matchedDomains = extractedSheetNames.filter((sheet) => domains.includes(sheet));
            setSelectedDomains(matchedDomains);
        };
        reader.readAsArrayBuffer(file);
    };

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
        setLoading(true);
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
        setLoading(false);
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
        console.log(files);

        if (files?.length) {
            setFileUploads((prev) => ({
                ...prev,
                [domain]: files[0],
            }));
            if (domain === "excel") {
                readExcelFile(files[0]);
            }
        }
    };


    // const handleDomainSelect = (domain: string): void => {
    //     setSelectedDomains((prev) =>
    //         prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    //     );
    // };
    const handleDomainSelect = (domain: string): void => {
        setSelectedDomains((prev) =>
            prev.includes(domain)
                ? prev.filter((d) => !sheetNames.includes(d) && d !== domain) // Prevent unselecting mapped sheets
                : [...prev, domain]
        );
    };


    const isCombinationVisible = (combo: string): boolean => {
        const comboParts: string[] = combo.split('|');
        return comboParts.every((part) => selectedDomains.includes(part));
    };



    const handleNext = async (): Promise<void> => {
        if (step === 1) {
            const visibleCombinations = combinations.filter(isCombinationVisible);
            setSelectedCombinations(visibleCombinations);

        }  else if (step === 2) {
            // selectedCombinations.forEach((combo) => {
            //   formData.set(combo, editableTexts[combo] || "");
            // });
            formData.set("sessionId", sessionId);
            formData.set("selectedDomains", JSON.stringify(selectedDomains));
            formData.set("selectedCombination", JSON.stringify(selectedCombinations));
            // formData.set("CombinationValues", JSON.stringify(editableTexts));
            // Store uploaded files in FormData
            ['excel','yaml'].forEach((domain) => {
                if (fileUploads[domain]) {
                    formData.append("files", fileUploads[domain] as File);
                }
            });
            study_info['indication'] = indication;
            study_info['studyInfo'] = studyInfo;

            formData.set("study_info", JSON.stringify(study_info));
            // formData.set("config", JSON.stringify(settingsData));


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

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
            {/* Header Section */}
            <header
                className="w-full bg-white shadow-md border-b border-gray-300 p-4 flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center">
                    <img
                        src="https://www.saama.com/wp-content/uploads/saama_logo.svg"
                        alt="Logo"
                        className="w-20 h-20"
                    />
                    <h1 className="ml-4 text-xl font-semibold text-gray-800">|</h1>
                    <h1 className="ml-4 text-xl font-semibold text-gray-800">QAD - Inference</h1>
                </div>

                {/* Right Section - Settings Button */}
                {/*<button*/}
                {/*    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"*/}
                {/*    onClick={() => setShowSettings(true)}*/}
                {/*>*/}
                {/*    ⚙️ Settings*/}
                {/*</button>*/}
            </header>

            {/* Card Container */}
            <main className="flex flex-col items-center justify-around flex-grow p-8">
                <Tabs defaultValue="account" className="flex flex-col  border-gray-300">
                    <TabsList className="grid w-full grid-cols-2 ">
                        <TabsTrigger value="account">Inference</TabsTrigger>
                        <TabsTrigger value="password">Result</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">

                        <Card
                            className=" flex flex-col justify-around w-[50rem]  h-auto p-8 shadow-lg rounded-xl bg-white border border-gray-300">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-semibold text-gray-800">
                                    {step === 0 ? "Select Domains & Combinations" : step === 1 ? "Provide the Study Info" : step === 2 ? "Upload the Domain File" : "Results"}</CardTitle>
                            </CardHeader>

                            <CardContent className="text-center text-gray-700 space-y-6">
                                {/* Step 1: Select Domains */}
                                {step === 1 && (
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
                                            <h3 className="text-lg font-medium text-gray-700">Available
                                                Combinations</h3>
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

                                {step === 0 && (
                                    <div className="space-y-6">
                                        {/* Excel File Upload */}
                                        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                            <div className="text-left">
                                                <h3 className="text-lg font-medium text-blue-700">Upload Excel File</h3>
                                                <p className="text-sm text-gray-600">
                                                    Only .xlsx or .xls files are allowed &nbsp;
                                                    <a
                                                        href="/samples/sample.xlsx"
                                                        download
                                                        className="text-blue-600 hover:underline"
                                                    >
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
                                                    onChange={(e) => handleFileChange(e, "excel")}
                                                />
                                                <label
                                                    htmlFor="excel-upload"
                                                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                                                >
                                                    <FiUpload className="text-lg"/>
                                                    {fileUploads["excel"] ? fileUploads["excel"]?.name : "Choose Excel File"}
                                                </label>
                                            </div>
                                        </div>

                                        {/* YAML File Upload */}
                                        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                            <div className="text-left">
                                                <h3 className="text-lg font-medium text-blue-700">Upload YAML File</h3>
                                                <p className="text-sm text-gray-600">
                                                    Only .yaml or .yml files are allowed &nbsp;
                                                    <a
                                                        href="/samples/sample.yaml"
                                                        download
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Download Sample
                                                    </a>
                                                </p>
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    id="yaml-upload"
                                                    accept=".yaml, .yml"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, "yaml")}
                                                />
                                                <label
                                                    htmlFor="yaml-upload"
                                                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                                                >
                                                    <FiUpload className="text-lg"/>
                                                    {fileUploads["yaml"] ? fileUploads["yaml"]?.name : "Choose YAML File"}
                                                </label>
                                            </div>
                                            {/* Display Sheet Names */}

                                        </div>

                                        {/*{sheetNames.length > 0 && (*/}
                                        {/*    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">*/}
                                        {/*        <h4 className="text-lg font-medium text-blue-700">Domain Names:</h4>*/}
                                        {/*        <p className="text-sm text-gray-600">*/}
                                        {/*            /!*className="list-disc text-gray-700">*!/*/}
                                        {/*                {sheetNames.map((sheet, index) => (*/}
                                        {/*                    <li key={index}>{sheet}</li>*/}
                                        {/*                ))}*/}
                                        {/*            /!*</ul>*!/*/}
                                        {/*            </p>*/}
                                        {/*    </div>*/}
                                        {/*    )}*/}

                                        {/* Submit Button (Enabled Only When Both Files Are Uploaded) */}

                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-blue-700">Study Details</h3>

                                        {/* Study Info Text Box */}
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700">Therapeutic
                                                Area</label>
                                            <textarea
                                                className="w-full h-24 mt-1 p-3 border border-gray-300 rounded-lg"
                                                value={studyInfo}
                                                onChange={(e) => setStudyInfo(e.target.value)}
                                            />
                                        </div>

                                        {/* Indication Text Box */}
                                        <div className="mt-3">
                                            <label
                                                className="block text-sm font-medium text-gray-700">Indication</label>
                                            <textarea
                                                className="w-full h-24 mt-1 p-3 border border-gray-300 rounded-lg"
                                                value={indication}
                                                onChange={(e) => setIndication(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-center mt-6">
                                            {fileUploads["excel"] && fileUploads["yaml"] && (
                                                <Button
                                                    className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={handleNext}
                                                >
                                                    Submit Files
                                                </Button>
                                            )}
                                        </div>


                                    </div>
                                )}
                                {step === 3 && (
                                    <motion.div className="text-center" initial={{opacity: 0, scale: 0.9}}
                                                animate={{opacity: 1, scale: 1}}
                                                transition={{duration: 0.5, ease: "easeOut"}}>
                                        <h3 className="text-2xl font-semibold text-gray-800">Processing Status</h3>
                                        <motion.div className="mt-6 flex flex-col items-center"
                                                    initial={{opacity: 0, y: -10}}
                                                    animate={{opacity: 1, y: 0}}
                                                    transition={{duration: 0.8, ease: "easeOut"}}>
                                            {status.toLowerCase().includes("end:") ? (
                                                <>
                                                    <motion.span
                                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold text-lg shadow-md">
                                                        <FiCheckCircle className="text-2xl animate-pulse"/> Process
                                                        Completed -
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

                            </CardContent>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-6">
                                {step > 0 && step < 3 && (
                                    <Button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
                                            onClick={handleBack}>
                                        Back
                                    </Button>
                                )}
                                {step < 2 && (
                                    <Button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white "
                                            onClick={selectedDomains.length > 0 ? handleNext : () => {
                                            }}>


                                        Next
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                    <TabsContent value="password">
                        <Card
                            className="flex flex-col justify-around w-[50rem]  h-auto p-8 shadow-lg rounded-xl bg-white border border-gray-300">
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle className="text-2xl font-semibold text-gray-800">Inference
                                    Results</CardTitle>
                                {/* Refresh Button */}
                                <Button
                                    variant="outline"
                                    onClick={fetchFiles}
                                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-500 hover:text-white"
                                    disabled={loading} // Disable button when loading
                                >
                                    <FiRefreshCw className={`text-lg ${loading ? "animate-spin" : ""}`}/>
                                    {loading ? "Refreshing..." : "Refresh"}
                                </Button>
                            </CardHeader>
                            <CardContent className="text-gray-700 space-y-4">
                                {loading ? (
                                    <p className="text-gray-600 text-center">Fetching results...</p>
                                ) : downloadFiles.length === 0 ? (
                                    <p className="text-gray-600 text-center">No results available. Click Refresh to
                                        check again.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {downloadFiles.map((file, index) => (
                                            file !== "END" && (
                                                <li key={index}
                                                    className="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow">
                                                    <span className="text-gray-800">{file}</span>
                                                    <a
                                                        href={`${BASE_URL}/download/${sessionId}/${file}`}
                                                        download
                                                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                                                    >
                                                        <FiDownload className="text-lg"/> Download
                                                    </a>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            {status.toLowerCase().includes("completed") && (
                <aside className="w-1/2 bg-white shadow-lg p-4 border-l border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Downloadable Files</h3>
                    {downloadFiles.length === 0 ? (
                        <p className="text-gray-600">Fetching files...</p>
                    ) : (
                        <ul className="space-y-2">
                            {downloadFiles.map((file, index) => (
                                file !== "END" && (
                                    <li key={index}
                                        className="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow">
                                        <span className="text-gray-800">{file}</span>
                                        <a
                                            href={`${BASE_URL}/download/${sessionId}/${file}`}
                                            download
                                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                                        >
                                            <FiDownload className="text-lg"/> Download
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    )}
                </aside>
            )}
            {/*{showSettings && (*/}
            {/*    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">*/}
            {/*        <div className="bg-white w-full max-w-lg max-h-[80vh] p-6 rounded-lg shadow-lg overflow-y-auto">*/}
            {/*            <h2 className="text-xl font-semibold mb-4 text-gray-800">Settings</h2>*/}

            {/*            /!* Form Fields *!/*/}
            {/*            <div className="space-y-4">*/}
            {/*                /!* VLLM URL *!/*/}
            {/*                <div>*/}
            {/*                    <label className="block text-sm font-medium text-gray-700">VLLM URL</label>*/}
            {/*                    <input*/}
            {/*                        type="text"*/}
            {/*                        className="w-full border p-2 rounded-lg"*/}
            {/*                        value={settingsData.vllm_url || ""}*/}
            {/*                        onChange={(e) => setSettingsData(prev => ({ ...prev, vllm_url: e.target.value }))}*/}
            {/*                        placeholder="Enter VLLM URL"*/}
            {/*                    />*/}
            {/*                </div>*/}

            {/*                /!* Model Name *!/*/}
            {/*                <div>*/}
            {/*                    <label className="block text-sm font-medium text-gray-700">Model Name</label>*/}
            {/*                    <input*/}
            {/*                        type="text"*/}
            {/*                        className="w-full border p-2 rounded-lg"*/}
            {/*                        value={settingsData.model_name || ""}*/}
            {/*                        onChange={(e) => setSettingsData(prev => ({ ...prev, model_name: e.target.value }))}*/}
            {/*                        placeholder="Enter Model Name"*/}
            {/*                    />*/}
            {/*                </div>*/}

            {/*                /!* API Key *!/*/}
            {/*                <div>*/}
            {/*                    <label className="block text-sm font-medium text-gray-700">API Key</label>*/}
            {/*                    <input*/}
            {/*                        type="text"*/}
            {/*                        className="w-full border p-2 rounded-lg"*/}
            {/*                        value={settingsData.api_key || ""}*/}
            {/*                        onChange={(e) => setSettingsData(prev => ({ ...prev, api_key: e.target.value }))}*/}
            {/*                        placeholder="Enter API Key"*/}
            {/*                    />*/}
            {/*                </div>*/}

            {/*                /!* ID Generation Toggle *!/*/}
            {/*                <div className="flex items-center justify-between">*/}
            {/*                    <label className="text-sm font-medium text-gray-700">Enable ID Generation</label>*/}
            {/*                    <input*/}
            {/*                        type="checkbox"*/}
            {/*                        className="w-5 h-5"*/}
            {/*                        checked={settingsData.is_id_generation || false}*/}
            {/*                        onChange={(e) => setSettingsData(prev => ({ ...prev, is_id_generation: e.target.checked }))}*/}
            {/*                    />*/}
            {/*                </div>*/}

            {/*                /!* Conditionally Rendered OpenAI Fields *!/*/}
            {/*                {settingsData.is_id_generation && (*/}
            {/*                    <div className="space-y-4 border-t border-gray-300 pt-4">*/}
            {/*                        <div>*/}
            {/*                            <label className="block text-sm font-medium text-gray-700">OpenAI Key</label>*/}
            {/*                            <input*/}
            {/*                                type="text"*/}
            {/*                                className="w-full border p-2 rounded-lg"*/}
            {/*                                value={settingsData.open_ai_key || ""}*/}
            {/*                                onChange={(e) => setSettingsData(prev => ({ ...prev, open_ai_key: e.target.value }))}*/}
            {/*                                placeholder="Enter OpenAI Key"*/}
            {/*                            />*/}
            {/*                        </div>*/}

            {/*                        <div>*/}
            {/*                            <label className="block text-sm font-medium text-gray-700">OpenAI Endpoint</label>*/}
            {/*                            <input*/}
            {/*                                type="text"*/}
            {/*                                className="w-full border p-2 rounded-lg"*/}
            {/*                                value={settingsData.open_ai_endpoint || ""}*/}
            {/*                                onChange={(e) => setSettingsData(prev => ({ ...prev, open_ai_endpoint: e.target.value }))}*/}
            {/*                                placeholder="Enter OpenAI Endpoint"*/}
            {/*                            />*/}
            {/*                        </div>*/}

            {/*                        <div>*/}
            {/*                            <label className="block text-sm font-medium text-gray-700">OpenAI Version</label>*/}
            {/*                            <input*/}
            {/*                                type="text"*/}
            {/*                                className="w-full border p-2 rounded-lg"*/}
            {/*                                value={settingsData.open_ai_version || ""}*/}
            {/*                                onChange={(e) => setSettingsData(prev => ({ ...prev, open_ai_version: e.target.value }))}*/}
            {/*                                placeholder="Enter OpenAI Version"*/}
            {/*                            />*/}
            {/*                        </div>*/}

            {/*                        <div>*/}
            {/*                            <label className="block text-sm font-medium text-gray-700">OpenAI Model</label>*/}
            {/*                            <input*/}
            {/*                                type="text"*/}
            {/*                                className="w-full border p-2 rounded-lg"*/}
            {/*                                value={settingsData.open_ai_model || ""}*/}
            {/*                                onChange={(e) => setSettingsData(prev => ({ ...prev, open_ai_model: e.target.value }))}*/}
            {/*                                placeholder="Enter OpenAI Model"*/}
            {/*                            />*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                )}*/}
            {/*            </div>*/}

            {/*            /!* Display JSON Output *!/*/}
            {/*            {Object.keys(settingsData).length > 0 && (*/}
            {/*                <div className="mt-4 p-3 bg-gray-100 rounded-lg">*/}
            {/*                    <h3 className="font-medium text-gray-700">Generated JSON:</h3>*/}
            {/*                    <pre className="text-sm text-gray-800 bg-gray-200 p-2 rounded max-h-40 overflow-y-auto">*/}
            {/*            {JSON.stringify(settingsData, null, 2)}*/}
            {/*        </pre>*/}
            {/*                </div>*/}
            {/*            )}*/}

            {/*            /!* Close Button *!/*/}
            {/*            <button*/}
            {/*                className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"*/}
            {/*                onClick={() => setShowSettings(false)}*/}
            {/*            >*/}
            {/*                Close*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};

export default InferenceUI;