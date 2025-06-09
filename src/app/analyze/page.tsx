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
    const [oldFormValues, setOldFormValues] = useState(null); // holds form data
    const [compareKeys, setCompareKeys] = useState(['Rate', 'Summary', 'relevancy']);
    const [isReset, setIsReset] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    const handleReset = () => {
        setResumeResponse(null);
        setIsReset(true);
        setIsEdit(false);
    };

    const handleOldFormValues = (formData: any) => {
        setOldFormValues(formData); // ✅ Save form values here
    };

    const OnEdit = () => {
        setResumeResponse(null);
        setIsEdit(true);
    };

    return (
        <>
            {resumeResponse ? (
                <ResumeResult
                    resumeResponse={resumeResponse}
                    onReset={handleReset}
                    onEdit={OnEdit}
                    compareKeys={compareKeys}
                />
            ) : (
                <UploadResume
                    shareResumeResponse={setResumeResponse}
                    keys={setCompareKeys}
                    isReset={isReset}
                    isEdit={isEdit}
                    oldFormValuesData={oldFormValues}
                    setOldFormValues={handleOldFormValues}
                />
            )}
        </>
    );
}
