"use client";

import { useState, useEffect } from "react";
import { useStudyData } from "@/context/StudyDataContext";
import { fetchFilteredScenarios, saveUpdatedScenarios } from "@/lib/api/scenarios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {ScenarioDataTable} from "@/components/ScenarioTable";

interface ScenarioType {
    [key: string]: any;
}

export default function ScenariosPage() {
    const { sheetNames } = useStudyData();
    const [scenarios, setScenarios] = useState<ScenarioType[]>([]);
    const [editedScenarios, setEditedScenarios] = useState<ScenarioType[]>([]);
    const [columns, setColumns] = useState<string[]>([]);

    const loadScenarios = async () => {
        try {
            const data = await fetchFilteredScenarios(sheetNames);
            if (data.length > 0) {
                const dynamicCols = Object.keys(data[0]).filter(
                    (col) => !col.toLowerCase().endsWith("_id")
                );
                setColumns(dynamicCols);
            }
            const updated = data.map(item => ({ ...item, active: true }));
            setScenarios(updated);
            setEditedScenarios(updated);
            toast.success("Scenarios loaded!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to load scenarios.");
        }
    };

    useEffect(() => {
        if (sheetNames.length > 0) {
            loadScenarios();
        }
    }, [sheetNames]);

    // const handleInputChange = (index: number, key: string, value: any) => {
    //     const updated = [...editedScenarios];
    //     updated[index][key] = value;
    //     setEditedScenarios(updated);
    // };

    const handleToggleActivate = (index: number) => {
        const updated = [...editedScenarios];
        updated[index].active = !updated[index].active;
        setEditedScenarios(updated);
    };

    // const handleRowGenerate = async (index: number) => {
    //     try {
    //         const payload = editedScenarios[index];
    //         const response = await generateScenarioFromLLM(payload);
    //         const updated = [...editedScenarios];
    //         updated[index]["Simplified Child Scenario (Plain English)"] = response.generated_text;
    //         setEditedScenarios(updated);
    //         toast.success("Scenario generated!");
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Failed to generate scenario.");
    //     }
    // };

    const handleSaveAll = async () => {
        try {
            await saveUpdatedScenarios(editedScenarios);
            toast.success("Scenarios saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Error saving scenarios.");
        }
    };

    // const renderCell = (value: any, editable: boolean, onChange: (val: string) => void) => {
    //     if (editable) {
    //         return (
    //             <textarea
    //                 className="w-full border rounded p-1"
    //                 value={value ?? ""}
    //                 onChange={(e) => onChange(e.target.value)}
    //             />
    //         );
    //     } else if (Array.isArray(value)) {
    //         return (
    //             <ul className="list-disc list-inside space-y-1">
    //                 {value.map((item, idx) => (
    //                     <li key={idx}>{item}</li>
    //                 ))}
    //             </ul>
    //         );
    //     } else if (typeof value === "object" && value !== null) {
    //         return (
    //             <ul className="list-disc list-inside space-y-1">
    //                 {Object.entries(value).map(([k, v], idx) => (
    //                     <li key={idx}>
    //                         <strong>{k}:</strong> {v}
    //                     </li>
    //                 ))}
    //             </ul>
    //         );
    //     } else {
    //         return value ?? "-";
    //     }
    // };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Scenarios</h1>
                <Button
                    onClick={handleSaveAll}
                    disabled={editedScenarios.length <= 0}

                >Save All</Button>
            </div>

            {editedScenarios.length > 0 ? (
                <div className="overflow-x-auto bg-white p-4 rounded shadow-md">
                    <ScenarioDataTable
                        scenarios={editedScenarios}
                        setScenarios={setEditedScenarios}
                        columnsList={columns}
                    />
                </div>

            ) : (
                <p className="text-gray-600">No scenarios available. Upload study data first.</p>
            )}
        </div>
    );
}
