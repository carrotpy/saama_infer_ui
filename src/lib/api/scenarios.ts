import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function getStudyHeader() {
    const studyName = sessionStorage.getItem("selectedStudy");
    if (!studyName) throw new Error("No study selected");
    return { "x-study-name": studyName };
}

export async function fetchFilteredScenarios(sheetNames: string[]) {
    const response = await axios.post(`${BASE_URL}/api/scenarios`, { sheet_names: sheetNames }, {
        headers: getStudyHeader(),
    });
    return response.data;
}

export async function saveUpdatedScenarios(scenarios: any[]) {
    const response = await axios.post(`${BASE_URL}/api/scenarios/save`, { scenarios }, {
        headers: getStudyHeader(),
    });
    return response.data;
}

// ✅ Generate modified scenario from backend LLM
export async function generateScenarioFromLLM(payload: any) {
    const response = await axios.post(`${BASE_URL}/api/scenarios/generate`, payload, {
        headers: getStudyHeader(),
    });
    return response.data;
}