"use client";

import Image from "next/image";
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { z } from "zod";
import { staticValue } from "../static/const";
import { PostAPI } from "../service/api.config";
import dynamic from "next/dynamic";

const ErrorAnimation = dynamic(() => import("./errorAnimation"), {
    ssr: false,
});

const Loader = dynamic(() => import("./loader"), {
    ssr: false,
})

const resumeFormSchema = z.object({
    jobDescription: z
        .string()
        .min(1, staticValue.resumeFormError.descriptionRequired),
    compare: z
        .array(z.string())
        .optional()
        .refine(
            (arr) => !arr || arr.every((item) => item.trim().length > 0),
            {
                message: staticValue.resumeFormError.customCompareFiledEmpty,
            }
        ),
    resumeFiles: z
        .any() // accept any input first
        .refine(
            (files) => Array.isArray(files) && files.length > 0,
            { message: staticValue.resumeFormError.uploadResume }
        )
        .refine(
            (files) => files?.length <= 3,
            { message: staticValue.resumeFormError.maxUploadResume }
        )
        .refine(
            (files) =>
                files?.every((file: File) =>
                    staticValue.allowedResumeFilesType.includes(file?.type)
                ),
            { message: staticValue.resumeFormError.resumeFileTypeError }
        ).refine(
            (files) =>
                files?.every((file: File) => file?.size > 0),
            { message: staticValue.resumeFormError.emptyCorruptedFile }
        )
        .refine(
            (files) =>
                files?.every((file: File) => file?.size <= 10.1 * 1024 * 1024),
            { message: staticValue.resumeFormError.filesizeError }
        ),
});

type ResumeFormData = z.infer<typeof resumeFormSchema>;

export default function UploadResume({ shareResumeResponse, isReset, keys }: { shareResumeResponse: any, isReset: boolean, keys: any }) {
    const [customCriteria, setCustomCriteria] = useState<string[]>([]);
    const criteria = staticValue.resumeCriteria;
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        reset,
        watch,
        formState: { errors },
    } = useForm<ResumeFormData>({
        resolver: zodResolver(resumeFormSchema), mode: "onChange",
        defaultValues: {
            compare: [],
        }
    });
    const [isError, setIsAPIError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleRemoveFile = (indexToRemove: number) => {
        const existingError = document.getElementById("resumeErrorField");
        if (existingError) {
            existingError.innerHTML = "";
        }
        const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setSelectedFiles(updatedFiles);
        setValue("resumeFiles", updatedFiles, { shouldValidate: true });
        trigger("resumeFiles");
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        e.target.value = ""; // allow re-uploading same file again
        const validNewFiles: File[] = [];
        for (const file of newFiles) {
            const isAllowedType = staticValue.allowedResumeFilesType.includes(file.type);
            const isNonEmpty = file.size > 0 && file.size <= 10.1 * 1024 * 1024;
            const isReadable = await isReadableFile(file);
            if (isAllowedType && isNonEmpty && isReadable) {
                if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        if (pdf.numPages <= 4) {
                            const existingError = document.getElementById("resumeErrorField");
                            if (existingError) {
                                existingError.innerHTML = "";
                            }
                            validNewFiles.push(file);
                        } else {
                            setTimeout(() => {
                                emptyCorruptedFileChangesDisplay(staticValue.resumeFormError.fileSizeExceede);
                            }, 60);
                        }
                    } catch (err) {
                        setTimeout(() => {
                            emptyCorruptedFileChangesDisplay(staticValue.resumeFormError.emptyCorruptedFile);
                        }, 50);
                    }
                } else {
                    validNewFiles.push(file);
                }
            } else {
                if (!isNonEmpty && isAllowedType) {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    if (pdf.numPages >= 4) {
                        setTimeout(() => {
                            emptyCorruptedFileChangesDisplay(staticValue.resumeFormError.filesizeError);
                        }, 60);
                    }
                } else if (isAllowedType) {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    if (pdf.numPages <= 4) {
                        setTimeout(() => {
                            emptyCorruptedFileChangesDisplay(staticValue.resumeFormError.maxUploadResume);
                        }, 60);
                    }
                } else if (!isAllowedType) {
                    setTimeout(() => {
                        emptyCorruptedFileChangesDisplay(staticValue.resumeFormError.resumeFileTypeError);
                    }, 60);
                }
            }
        }

        // Merge and remove duplicates
        const mergedValidFiles = [...selectedFiles, ...validNewFiles];
        const uniqueValidFiles = mergedValidFiles.filter(
            (file, index, self) =>
                index === self.findIndex(f => f.name === file.name && f.size === file.size)
        ).slice(0, 3); // limit to 3

        setValue("resumeFiles", uniqueValidFiles, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
        await trigger("resumeFiles");
        setSelectedFiles(uniqueValidFiles);
    };

    const isReadableFile = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const fileType = file.type.toLowerCase();
            const fileName = file.name.toLowerCase();
            if (file.size < 1024 && (fileType === "application/pdf" || fileName.endsWith(".pdf"))) {
                setTimeout(() => {
                    emptyCorruptedFileChangesDisplay(staticValue.resumeFormError.emptyCorruptedFile);
                }, 50);
                resolve(false);
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                const buffer = reader.result as ArrayBuffer;
                const uint8 = new Uint8Array(buffer);
                // Check PDF magic number
                if ((fileType === "application/pdf" || fileName.endsWith(".pdf")) &&
                    uint8[0] === 0x25 && uint8[1] === 0x50 &&
                    uint8[2] === 0x44 && uint8[3] === 0x46) {
                    // Additional: check if file ends with '%%EOF'
                    const tailReader = new FileReader();
                    tailReader.onload = () => {
                        const text = new TextDecoder().decode(tailReader.result as ArrayBuffer);
                        resolve(/%%EOF\s*$/.test(text)); // Improved EOF check
                    };
                    tailReader.onerror = () => resolve(false);
                    tailReader.readAsArrayBuffer(file.slice(-1024)); // read last 1KB
                    return;
                }
                else {
                    resolve(false);
                }
            };
            reader.onerror = () => {
                resolve(false);
            };
            // Read first 8 bytes
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    };

    const emptyCorruptedFileChangesDisplay = (errorMessage: string) => {
        const existingError = document.getElementById('resumeErrorField');

        // If error element already exists, update its message
        if (existingError) {
            // Get all elements with the same ID
            const allErrors = document.querySelectorAll('#resumeErrorField');

            allErrors.forEach((el) => {
                if (el !== existingError) {
                    el.remove(); // safely remove any duplicate error elements
                }
            });

            // Update the message on the existing one
            existingError.textContent = errorMessage;
        } else {
            // Else, create a new error element
            const label = document.getElementById('fileUploadLabel');
            const targetDiv = label?.querySelector('.text-center');

            if (label && targetDiv) {
                const newError = document.createElement('p');
                newError.id = 'resumeErrorField';
                newError.className = 'text-red-500 text-sm mb-0';
                newError.textContent = errorMessage;

                // Remove any other error <p> tags inside targetDiv if somehow duplicated manually
                const allErrors = targetDiv.querySelectorAll('#resumeErrorField');
                allErrors.forEach(el => el.remove());

                targetDiv.appendChild(newError);
            }
        }
    };


    const onSubmit = async (data: ResumeFormData) => {
        const formData = new FormData();
        data.resumeFiles.forEach((file: File) => {
            formData.append('files', file);
        });
        formData.append('job_post_info', data.jobDescription);
        formData.append(
            'keywords_str',
            Array.isArray(data?.compare) && data.compare.length === 0
                ? ''
                : JSON.stringify(data?.compare || [])
        );
        setIsLoading(true);

        try {
            const response = await fetch(PostAPI.analyseResume(), {
                method: 'POST',
                body: formData,
            });
            // Handle HTTP-level errors (e.g., 400, 500)
            if (!response.ok) {
                const errorMessage = await response.json();
                setIsAPIError(errorMessage.detail);
                setIsLoading(false);
                return;
            }
            // Parse the response only if successful
            const responseData = await response.json();
            setIsLoading(false);
            setIsAPIError(null);
            const additionalKeys = data?.compare?.length ? data.compare : staticValue.defaultKeyWords;
            const finalKeys = [...staticValue.defaultKeyWordForAllComapreValue, ...additionalKeys];
            const lowercaseKeys = finalKeys.map((key) =>
                key.toLowerCase().replace(/\s+/g, '_')
            );
            keys(lowercaseKeys);
            shareResumeResponse(responseData);
        } catch (error: any) {
            // Handle network errors or unexpected exceptions
            let errorMessage = "Something went wrong.";
            try {
                const data = await error.json(); // This will only work if error is a Response
                errorMessage = data?.detail || errorMessage;
            } catch (e) {
                // If error is not a Response or .json() fails
                errorMessage = error?.message || "Unexpected error occurred.";
            }
            setIsAPIError(errorMessage);
            setIsLoading(false);
        }


    };

    const handleRemoveCustom = (index: number) => {
        const removed = customCriteria[index];
        const updatedCustom = [...customCriteria];
        updatedCustom.splice(index, 1);
        setCustomCriteria(updatedCustom);
        const currentCompare = getValues("compare") || []; //  use getValues instead of watch
        const updatedCompare = currentCompare.filter((item: string) => item !== removed);
        setValue("compare", updatedCompare);
        trigger("compare");
    };

    useEffect(() => {
        if (isReset) {
            reset({
                compare: [],
                resumeFiles: [],
                jobDescription: ""
            });
            setSelectedFiles([]);
            setCustomCriteria([]);
        }
    }, [isReset, reset]);

    return (
        <>
            {
                isError ? (
                    <div className="flex items-center justify-center h-[-webkit-fill-available]  max-w-screen-lg w-[-webkit-fill-available] mx-auto p-3">
                        <div className="bg-white  p-8 text-center max-w-md w-[300px] ">
                            <div className="flex justify-center mb-4">
                                <ErrorAnimation />
                            </div>
                            <p className="text-red-400 text-xl font-semibold mb-2">Error!</p>
                            <p className="text-gray-700 text-sm mb-6">{isError}</p>
                            <button
                                onClick={() => {
                                    setIsAPIError(null);
                                    setIsLoading(false);
                                    reset({
                                        compare: [],
                                        resumeFiles: [],
                                        jobDescription: "",
                                    });
                                    setSelectedFiles([]);
                                    setCustomCriteria([]);
                                }}
                                className="bg-red-400 cursor-pointer hover:bg-red-500 text-white font-medium py-2 px-3 text-sm rounded-md transition duration-200 shadow-md hover:shadow-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) :
                    isLoading ? (
                        <Loader />
                    ) : (
                        <>
                            {
                                isReset && (
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="flex flex-col lg:flex-row lg:gap-25 lg:pt lg:ps-25 lg:pe-25 max-lg:gap-0 max-lg:ps-8 max-lg:pe-8 gap-0 mb-3">
                                            {/* Left Section */}
                                            <div className="lg:w-10/20 w-full">
                                                {/* Heading */}
                                                <p className="text-[23px] sm:text-[28px] text-[#181D27]  font-(family-name:--font-inter) mb-1 flex items-center gap-1">
                                                    <span className="font-bold">Upload the Job Description</span>
                                                    <span className=" p-1 rounded-md relative" tabIndex={0}>
                                                        <Image src="/assets/info.png" alt="informationicon" height={20} width={20} className="w-5 h-5 tooltip-trigger  cursor-pointer" />
                                                        <span className="absolute tooltip-content left-1/5 w-[250px] p-2 text-left top-7 left-[-100px] sm:left-[0px] transform -translate-x-1/2 bg-(--primary-blue) text-white text-xs rounded-md px-3 opacity-0  transition-opacity duration-200  hidden">
                                                            To gain accuracy in the results, start by specifying the Job Title in the first row, followed by the description.<br /><br />
                                                            <strong className="mt-3">Example:</strong><br />
                                                            Software Engineer | Minimum 1 year of experience<br />
                                                            Then, continue with the detailed job description below.
                                                        </span>
                                                    </span>
                                                </p>
                                                <p className="text-[#979797] leading-[18px] text-[16px] mb-5 font-(family-name:--font-dm-sans)">
                                                    Please enter the job description here. Include details about the role, responsibilities, and required qualifications.
                                                </p>
                                                <textarea
                                                    {...register("jobDescription")}
                                                    className="mb-2 border-1 border-dashed text-[#5B5B72] border-cyan-500 font-(family-name:--font-inter) focus:outline-none text-[14px] focus:border-cyan-600 rounded-[15px] p-2 w-full"
                                                    rows={3}
                                                    placeholder="Enter your job description..."
                                                />
                                                {errors.jobDescription && (
                                                    <p className="text-red-500 text-sm mb-4">{errors.jobDescription.message}</p>
                                                )}
                                                <p className="text-[23px] sm:text-[28px] text-[#181D27] font-bold font-(family-name:--font-inter) mb-3">
                                                    Choose to Compare
                                                </p>
                                                <div className="space-y-3">
                                                    {[...criteria, ...customCriteria].map((item, index) => (
                                                        <label key={index} className="flex items-center space-x-2  text-gray-700  font-(family-name:--font-inter) w-[fit-content]">
                                                            <input
                                                                type="checkbox"
                                                                className={`checkbox-input hidden ${item.trim().length <= 0 ? 'cursor-no-drop' : 'cursor-pointer'}`}
                                                                id={`checkbox-${index}`}
                                                                value={item}
                                                                checked={watch("compare")?.includes(item)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    const currentCompare = getValues("compare") || [];
                                                                    // Determine whether the item is from predefined criteria or custom criteria
                                                                    const isCustom = index >= criteria.length; // If index is beyond predefined criteria, it's a custom criteria
                                                                    const val = isCustom ? customCriteria[index - criteria.length] : criteria[index]; // Adjust the value depending on the source
                                                                    const isValid = val.trim().length > 0; // Check if custom criteria are valid
                                                                    // Update the comparison array based on checked status and validity of the value
                                                                    let updatedCompare;
                                                                    updatedCompare = checked && isValid
                                                                        ? [...new Set([...currentCompare, val])]  // Add value if valid and checked
                                                                        : currentCompare.filter((c) => c !== val); // Remove value if unchecked or invalid
                                                                    setValue("compare", updatedCompare); // Update the form value
                                                                    trigger("compare"); // Trigger validation
                                                                }}
                                                                disabled={item.trim().length <= 0}
                                                            />
                                                            <div className={`${item.trim().length <= 0 ? 'cursor-no-drop' : 'cursor-pointer'} w-5 h-5 rounded-md border border-gray-300 checkbox-container flex items-center justify-center`}>
                                                                {/* Checkmark */}
                                                                <svg
                                                                    className="w-4 h-4 checkmark hidden"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="white"
                                                                    strokeWidth="3"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                            {customCriteria.includes(item) ? (
                                                                <div className="flex items-center gap-10 text-[14px] ">
                                                                    <input
                                                                        type="text"
                                                                        className="border-1 text-[#5B5B72] border-dashed  border-cyan-500 font-(family-name:--font-inter) focus:outline-none text-[14px] focus:border-cyan-600 rounded-[15px] p-1 ps-3"
                                                                        value={item}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            const onlyLettersAndSpaces = val.replace(/[^a-zA-Z\s]/g, "");
                                                                            const updated = [...customCriteria];
                                                                            updated[index - criteria.length] = onlyLettersAndSpaces;
                                                                            setCustomCriteria(updated);
                                                                            const currentCompare = getValues("compare") || [];
                                                                            const isChecked = currentCompare.includes(item);
                                                                            // If the input is non-empty and the checkbox is checked, update the value
                                                                            let updatedCompare;
                                                                            if (val.trim() && isChecked) {
                                                                                updatedCompare = currentCompare.map((c) => (c === item ? val : c));
                                                                                if (!updatedCompare.includes(val)) {
                                                                                    updatedCompare.push(val);
                                                                                }
                                                                            } else {
                                                                                // If input is empty, remove from compare even if checked
                                                                                updatedCompare = currentCompare.filter((c) => c !== item);
                                                                            }
                                                                            setValue("compare", updatedCompare);
                                                                            trigger("compare");
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            const isValidKey =
                                                                                /^[a-zA-Z\s]$/.test(e.key) ||
                                                                                e.key === "Backspace" ||
                                                                                e.key === "Tab" ||
                                                                                e.key === "ArrowLeft" ||
                                                                                e.key === "ArrowRight";
                                                                            const cursorAtStart = e.currentTarget.selectionStart === 0;
                                                                            // Prevent invalid key OR space at the beginning
                                                                            if (!isValidKey || (e.key === " " && cursorAtStart)) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="cursor-pointer  font-semibold  text-(--primary-blue)"
                                                                        title="remove skill to compare"
                                                                        onClick={() => handleRemoveCustom(index - criteria.length)}
                                                                    >
                                                                        X
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[#5B5B72] font-(family-name:--font-inter) cursor-pointer">{item}</span>
                                                            )}
                                                        </label>
                                                    ))}
                                                </div>
                                                {
                                                    errors.compare && (
                                                        <p className="text-red-500 text-sm  mt-3">{errors.compare.message}</p>
                                                    )
                                                }
                                                <button
                                                    className="mt-3 max-lg:mb-8 text-[16px] text-[#068BA6] cursor-pointer font-(family-name:--font-inter)"
                                                    type="button"
                                                    onClick={() => setCustomCriteria([...customCriteria, ""])}
                                                >
                                                    + Add Others
                                                </button>
                                            </div >
                                            {/* Right Section */}
                                            < div className="lg:w-10/20 w-full" >
                                                <p className="text-[23px] sm:text-[28px] text-[#181D27] font-bold font-(family-name:--font-inter) mb-1">
                                                    Upload Resumes
                                                </p>
                                                <p className="text-[#979797] leading-[18px] text-[16px] mb-5 font-(family-name:--font-dm-sans)">
                                                    Please upload files in pdf  format and make sure the file size is under 10 MB & 4 pages.
                                                </p>
                                                <div className="border-1 border-dashed border-[#00B4D8] rounded-[15px] flex items-center justify-center h-[230px] sm:h-[280px] w-full mb-5">
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        id="file-upload"
                                                        accept=".pdf"
                                                        multiple
                                                        disabled={selectedFiles?.length >= 3}
                                                    />
                                                    <label htmlFor="file-upload" id="fileUploadLabel" className={`flex items-center justify-center w-full h-full ${selectedFiles?.length >= 3 ? 'cursor-no-drop' : 'cursor-pointer'} p-4`}>
                                                        <div className="text-center">
                                                            <div className="flex justify-center">
                                                                <img src="/assets/browse-icon.svg" alt="Browse icon" className="h-9 w-9 mb-2" />
                                                            </div>
                                                            <p className="text-black text-sm font-bold mb-2">Browse</p>
                                                            <p className="text-sm  text-[#2298BD] opacity-[0.7] mb-1 px-1 font-(family-name:--font-dm-sans)">
                                                                Format: .pdf & Max file size: 10 MB
                                                            </p>
                                                            {errors.resumeFiles && typeof errors.resumeFiles.message === "string" && (
                                                                <p id="resumeErrorField" className="text-red-500 text-sm mb-0">{errors.resumeFiles.message}</p>
                                                            )}
                                                        </div>
                                                    </label>
                                                </div>
                                                {
                                                    selectedFiles?.length > 0 && (
                                                        <ol className="list-decimal ml-5 mb-6">
                                                            {selectedFiles?.map((file: File, index: number) => (
                                                                <li key={index} className="list-item text-sm italic  text-[#03A2C2] font-semibold font-(family-name:--font-dm-sans)">
                                                                    <div className="flex items-center gap-10">
                                                                        <span>{file.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveFile(index)}
                                                                            className="cursor-pointer"
                                                                            title="Remove file"
                                                                        >
                                                                            X
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    )
                                                }
                                                <div className="flex justify-end gap-4 w-full">
                                                    <button
                                                        className="w-[40%] px-6 py-2 font-(family-name:--font-plus-jakarta) rounded-full font-semibold text-white bg-cyan-500 hover:bg-cyan-600 transition cursor-pointer"
                                                        type="submit"
                                                    >
                                                        Analyze
                                                    </button>
                                                </div>
                                            </div >
                                        </div >
                                    </form >
                                )
                            }
                        </>
                    )
            }
        </>
    );
}