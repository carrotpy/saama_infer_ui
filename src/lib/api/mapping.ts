import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function getStudyHeader() {
    const studyName = sessionStorage.getItem("selectedStudy");
    if (!studyName) throw new Error("No study selected");
    return { "x-study-name": studyName };
}

export async function uploadMappingYaml(yaml: File) {
    const formData = new FormData();
    formData.append("yaml", yaml);
    return await axios.post(`${BASE_URL}/api/mapping/import`, formData, {
        headers: { ...getStudyHeader() },
    });
}

export async function deleteMappingFile(file: string) {
    return await axios.delete(`${BASE_URL}/api/delete_file`, {
        headers: getStudyHeader(),
        data: { file_name: file }, // body for DELETE
    });
}

export async function downloadMappingFile() {
    //use fast api media mount to download the files
    const res = await axios.get(`${BASE_URL}/api/mapping/export`, {
        headers: getStudyHeader(),
        responseType: "blob",
    });
    return res.data;
}