"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // ✅ import a nice spinner icon
import { generateScenarioFromLLM } from "@/lib/api/scenarios";

interface ScenarioEditModalProps {
    open: boolean;
    onClose: () => void;
    scenario: any;
    onSave: (updatedScenario: any) => void;
}

export const ScenarioEditModal = ({ open, onClose, scenario, onSave }: ScenarioEditModalProps) => {
    const [localScenario, setLocalScenario] = useState({ ...scenario });
    const [loading, setLoading] = useState(false);

    const handleChange = (key: string, value: string) => {
        setLocalScenario((prev) => ({ ...prev, [key]: value }));
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            const result = await generateScenarioFromLLM(localScenario);
            setLocalScenario((prev) => ({
                ...prev,
                ["Scenario"]: result.generated_text,
            }));
            toast.success("Generated successfully");
        } catch (err) {
            console.log(err)
            toast.error("Failed to generate");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        onSave(localScenario);
        onClose();
        toast.success("Saved to table");
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Scenario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Simplified Child Scenario (Plain English)</label>
                        <Textarea
                            value={localScenario["Simplified Child Scenario (Plain English)"] || ""}
                            onChange={(e) => handleChange("Simplified Child Scenario (Plain English)", e.target.value)}
                            rows={10}
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Scenario</label>
                        <Textarea
                            value={localScenario.Scenario || ""}
                            onChange={(e) => handleChange("Scenario", e.target.value)}
                            rows={10}
                            disabled={true}
                        />
                    </div>


                    <Button onClick={handleGenerate} disabled={loading} className="flex items-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Generating..." : "Generate with LLM"}
                    </Button>
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
