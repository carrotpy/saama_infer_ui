"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadMappingYaml, deleteMappingFile, downloadMappingFile } from "@/lib/api/mapping";

export default function MappingPage() {
    const [yamlFile, setYamlFile] = useState<File | null>(null);

    const handleUpload = async () => {
        if (!yamlFile) {
            toast.error("Please select a YAML file");
            return;
        }
        try {
            await uploadMappingYaml(yamlFile);
            toast.success("Mapping YAML uploaded successfully");
        } catch (err) {
            console.error(err);
            toast.error(`Upload failed`);
        }
    };

    const handleDeleteAndCreate = async () => {
        const confirmDelete = confirm("This will delete the old mapping and create a new one. Continue?");
        if (!confirmDelete) return;

        try {
            await deleteMappingFile("mapping.yaml");
            toast.success("Old mapping archived. You can now upload a new one.");
        } catch (err) {
            console.error(err);
            toast.error(`Error archiving existing mapping`);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await downloadMappingFile();
            const url = URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "mapping.yaml");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            toast.error(`Error downloading mapping.yaml`);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Mapping Manager</h1>
                <div className="space-x-3">
                    <Button variant="destructive" onClick={handleDeleteAndCreate}>Create Mapping</Button>
                    <Button variant="outline" onClick={handleExport}>Export Mapping</Button>
                </div>
            </div>

            <Tabs defaultValue="yaml" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="yaml">Import Variable from YAML</TabsTrigger>
                    <TabsTrigger value="auto">Continue with Auto Mapper</TabsTrigger>
                </TabsList>

                <TabsContent value="yaml">
                    <div className="bg-white p-6 rounded shadow-md space-y-4">
                        <h2 className="text-lg font-medium text-gray-700">Upload YAML File</h2>
                        <input
                            type="file"
                            accept=".yaml, .yml"
                            onChange={(e) => setYamlFile(e.target.files?.[0] || null)}
                            className="border rounded px-4 py-2 w-full"
                        />
                        <Button className="mt-2" onClick={handleUpload}>Submit YAML</Button>
                    </div>
                </TabsContent>

                <TabsContent value="auto">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">Auto Mapper Modules</h2>
                        <p className="text-sm text-gray-600">Choose a strategy to automatically map your variables.</p>
                        {/* Add submodule options here */}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
