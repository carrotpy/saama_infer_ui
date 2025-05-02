import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Helper to get current study from sessionStorage (or context-based alternative)
function getStudyHeader() {
    const studyName = sessionStorage.getItem("selectedStudy");
    if (!studyName) throw new Error("No study selected in session");
    return { "x-study-name": studyName };
}

export async function submitNewStudy(payload: {
    study_name: string;
    therapeutic_area?: string;
    indication?: string;
}) {
    const response = await axios.post(`${BASE_URL}/api/onboard_study`, payload);
    return response.data;
}



export async function fetchStudies(): Promise<string[]> {
    const response = await axios.get(`${BASE_URL}/api/studies`);
    return response.data;
}

