"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ScenarioEditModal } from "./ScenarioEditModal";
import { Pencil ,ArrowUpDown} from "lucide-react";

interface ScenarioType {
    [key: string]: any;
}

interface ScenarioDataTableProps {
    scenarios: ScenarioType[];
    setScenarios: (updated: ScenarioType[]) => void;
    columnsList: string[];
}

export function ScenarioDataTable({ scenarios, setScenarios, columnsList }: ScenarioDataTableProps) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [localScenario, setLocalScenario] = useState<ScenarioType | null>(null);

    const openEditModal = (index: number) => {
        setEditingIndex(index);
        setLocalScenario({ ...scenarios[index] });
        setEditModalOpen(true);
    };

    const handleSave = (updatedScenario: ScenarioType) => {
        if (editingIndex === null) return;
        const updated = [...scenarios];
        updated[editingIndex] = updatedScenario;
        setScenarios(updated);
    };

    const dynamicColumns: ColumnDef<ScenarioType>[] = columnsList.map((key) => ({
        accessorKey: key,
        enableSorting: true, // ✅ sorting
        enableColumnFilter: key === "Domain_combination" || key.includes("Scenario"), // ✅ filtering
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {key.replace(/_/g, " ")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const value = row.original[key];
            if (Array.isArray(value)) return <ul>{value.map((v, i) => <li key={i}>{v}</li>)}</ul>;
            if (typeof value === "object" && value !== null)
                return <ul>{Object.entries(value).map(([k, v], i) => <li key={i}><strong>{k}:</strong> {v}</li>)}</ul>;
            return <span>{value ?? "-"}</span>;
        }
    }));

    const columns: ColumnDef<ScenarioType>[] = [
        ...dynamicColumns,
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEditModal(row.index)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={scenarios}
                filterableColumns={["Domain_combination", "Parent scenario", "Scenario"]}
            />
            {editModalOpen && localScenario && (
                <ScenarioEditModal
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    scenario={localScenario}
                    onSave={handleSave}

                />
            )}
        </>
    );
}
