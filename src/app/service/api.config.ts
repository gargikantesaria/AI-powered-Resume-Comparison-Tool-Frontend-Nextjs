const BASE_URL = process.env.NEXT_PUBLIC_AI_RESUME_ANALYSE;

export const PostAPI = {
    analyseResume: () => `${BASE_URL}analyze-resumes/`,
};