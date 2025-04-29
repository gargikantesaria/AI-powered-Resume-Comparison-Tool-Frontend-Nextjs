"use client";

import { useState } from 'react';
import dynamic from "next/dynamic";

const ResumeResult = dynamic(() => import("../component/resumeResult"), {
    ssr: false,
});

const UploadResume = dynamic(() => import("../component/uploadResume"), {
    ssr: false,
});

export default function Analyze() {
    const [resumeResponse, setResumeResponse] = useState(null);
    const [compareKeys, setCompareKeys] = useState(['Rate', 'Summary', 'relevancy']);
    const [isReset, setIsReset] = useState(true);

    const handleReset = () => {
        setResumeResponse(null);
        setIsReset(true); // Set reset state to true when reset happens
    };

    return (
        <>
            {resumeResponse ? (
                <ResumeResult
                    resumeResponse={resumeResponse}
                    onReset={handleReset}
                    compareKeys={compareKeys}
                />
            ) : (
                <UploadResume
                    shareResumeResponse={setResumeResponse}
                    keys={setCompareKeys}
                    isReset={isReset}
                />
            )}
        </>
    );
}
