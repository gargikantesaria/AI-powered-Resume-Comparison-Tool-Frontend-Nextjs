import { JSX, Key, useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const ErrorAnimation = dynamic(() => import("./errorAnimation"), {
    ssr: false,
});

export default function ResumeResult({ resumeResponse, onReset, compareKeys, onEdit }: any) {

    const [resumeData, setResumeData] = useState<any[] | null>(null);


    useEffect(() => {
        const rawData = resumeResponse.data;
        const parsedArray = Object.values(rawData).map((entryStr: any) => {
            const cleanEntry: Record<string, any> = {};

            // Step 1: Match string values (single or double quotes)
            const stringRegex = /(\w+)\s*=\s*'(.*?)'(?=\s\w+=|$)/g;
            let match;
            while ((match = stringRegex.exec(entryStr)) !== null) {
                const key = match[1];
                let value = match[2];
                // Handle escaped quotes
                if (value.startsWith('\\"') && value.endsWith('\\"')) {
                    value = value.replace(/\\"/g, '"');
                }
                cleanEntry[key] = value;
            }

            // Step 2: Match boolean values (True/False)
            const booleanRegex = /(\w+)\s*=\s*(True|False)/g;
            while ((match = booleanRegex.exec(entryStr)) !== null) {
                const key = match[1];
                const value = match[2] === "True"; // Convert to boolean true or false
                cleanEntry[key] = value;
            }

            // Step 3: Match number values
            const numberRegex = /(\w+)\s*=\s*(-?\d+(\.\d+)?)/g;
            while ((match = numberRegex.exec(entryStr)) !== null) {
                const key = match[1];
                const value = parseFloat(match[2]);
                cleanEntry[key] = value;
            }

            // Step 4: Match escaped string values (e.g., key=\"value\")
            const escapedStringRegex = /(\w+)\s*=\s*\\?"([^\\"]+)\\?"/g;
            while ((match = escapedStringRegex.exec(entryStr)) !== null) {
                const key = match[1];
                let value = match[2];
                // Handle escaped quotes
                value = value.replace(/\\"/g, '"');
                cleanEntry[key] = value;
            }

            // For additional processing on compareKeys (skills, experience, etc.)
            compareKeys.forEach((key: string) => {
                try {
                    const rawValue = cleanEntry[key];
                    if (typeof rawValue === 'string') {
                        if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
                            // It's an array
                            try {
                                // Replace ONLY single quotes around words (not inside the words)
                                const fixedRawValue = rawValue.replace(/'([^']+)'/g, '"$1"');
                                cleanEntry[key] = JSON.parse(fixedRawValue);
                            } catch (error) {
                                console.error(`Error parsing key ${key}:`, error);
                                const fixedRawValue = rawValue
                                    .replace(/^\[/, '')     // remove starting [
                                    .replace(/\]$/, '')     // remove ending ]
                                    .split(/,(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/) // split by commas outside quotes
                                    .map(item => {
                                        // Clean each item
                                        const trimmed = item.trim();
                                        const withoutQuotes = trimmed.replace(/^['"]|['"]$/g, ''); // remove starting/ending quotes
                                        const escaped = withoutQuotes.replace(/"/g, '\\"'); // escape internal double quotes
                                        return `"${escaped}"`; // wrap each properly
                                    })
                                    .join(',');

                                // Step 2: Parse into JSON array
                                cleanEntry[key] = JSON.parse(`[${fixedRawValue}]`);
                            }
                        } else if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
                            // It's an object
                            cleanEntry[key] = JSON.parse(rawValue.replace(/'/g, '"')); // fix single to double quotes
                        } else {
                            // It's a regular string (no need to parse)
                            cleanEntry[key] = rawValue;
                        }
                    } else {
                        cleanEntry[key] = rawValue; // If it's not a string, just keep the raw value
                    }
                } catch (error) {
                    console.error(`Error parsing key ${key}:`, error);
                    cleanEntry[key] = []; // fallback
                }
            });
            return cleanEntry;
        });
        setResumeData(parsedArray)
    }, [resumeResponse?.data])

    function formatCriteriaKey(key: string): string {
        return key
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()); // Capitalize each word
    }

    function FormateUI(value: any, criteria: string): JSX.Element {
        const textStyle = "text-[14px] text-[15px] text-[#000000] wrap-break-word d-block w-[250px] pr-5";

        if (criteria === 'relevancy') {
            let numericValue = typeof value === 'string' && value.includes('%')
                ? parseFloat(value.replace('%', ''))
                : parseFloat(value);

            let color = 'text-gray-500';

            if (!isNaN(numericValue)) {
                if (numericValue <= 60) {
                    color = 'text-red-600';
                } else if (numericValue <= 84) {
                    color = 'text-orange-500';
                } else {
                    color = 'text-green-600';
                }
            }

            return (
                !isNaN(numericValue) ? (
                    <span className={`inline-flex items-center justify-center w-[250px] font-semibold ${color}`}>
                        {`${numericValue}%`}
                    </span>
                ) : (
                    <>
                        <Image
                            src="/assets/caution.png"
                            alt="Caution"
                            height={20}
                            width={20}
                            className="w-7 h-7 m-auto"
                        />
                        <p className="text-center text-[#00B4D8] font-bold mt-1 text-[15px]">
                            Not Detected
                        </p>
                    </>
                )
            );

        }


        // Case 1: When value is a string
        if (typeof value === 'string') {
            if (value === '-') {
                return <>
                    <Image src="/assets/caution.png" alt="Caution" height={20} width={20} className="w-7 h-7 m-auto" />
                    <p className="text-center text-[#00B4D8] font-bold mt-1 text-[15px]">Not Detected</p>
                </>
            }
            return <span className={textStyle}>{value}</span>;
        }

        // Case 2: When value is an array of strings (render as a list)
        if (Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string')) {
            return (
                <ul className="list-disc pl-5 d-block w-[250px]">
                    {value.map((item, index) => (
                        <li key={index} className={textStyle}>
                            {item}
                        </li>
                    ))}
                </ul>
            );
        }

        // Case 3: When value is an array of objects
        if (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every(item => typeof item === 'object' && !Array.isArray(item))
        ) {
            return (
                <ul className="list-disc pl-5 d-block w-[250px]">
                    {value.map((item, index) => (
                        <li key={index} className={textStyle}>
                            {Object.entries(item).map(([key, val], subIndex) => (
                                <div key={subIndex}>
                                    <strong>{key}: </strong>
                                    <span>{String(val)}</span>
                                </div>
                            ))}
                        </li>
                    ))}
                </ul>
            );
        }

        // Default case: If value is not a string, array, or object
        return <>
            <Image src="/assets/caution.png" alt="Caution" height={20} width={20} className="w-7 h-7 m-auto" />
            <p className="text-center text-[#00B4D8] font-bold mt-1 text-[15px]">Not Detected</p>
        </>
    }

    if (resumeData === null) {
        return null;
    }

    const hasUndefinedValues = resumeData.every((obj) =>
        Object.values(obj).every((value) => value === undefined)
    );

    return (
        <>
            {!hasUndefinedValues ? (
                <div className=" p-3">
                    <p className="text-center text-[#021518] text-[33px]  font-bold mb-6">Profile Analysis</p>
                    {/* <div className="overflow-x-auto"> */}
                    <div className="max-w-[1500px] mx-auto overflow-x-auto" >
                        <table className="text-center table-fixed mx-auto max-w-[1500px]">
                            <thead className="border border-[#00B4D8]">
                                <tr className="bg-white">
                                    <th className="p-2 text-[#03A2C2] min-w-[250px] max-w-[250px] w-[250px] font-semibold border border-[#00B4D8] h-[100px] align-middle text-[20px]">Criteria</th>
                                    {resumeData?.map((candidate, i) => (
                                        <th
                                            key={i}
                                            className="p-2 text-black w-[250px] min-w-[250px] max-w-[250px] font-semibold border border-[#00B4D8] align-middle text-[20px]"
                                        >
                                            {(
                                                (candidate?.name || `Candidate ${i + 1}`)
                                                    .replace(/^"|"$/g, '') // Remove leading/trailing quotes
                                                    .toLowerCase() // Convert all to lowercase
                                                    .split(' ') // Split the string into an array of words
                                                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
                                                    .join(' ') // Join the words back into a string
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {compareKeys.map((criteria: string, i: Key | null | undefined) => (
                                    <tr key={i} className="border border-[#00B4D8]">
                                        <td className="text-[20px] text-[#03A2C2] font-semibold p-2 border border-[#00B4D8] align-middle min-h-[150px]">
                                            {formatCriteriaKey(criteria)}
                                        </td>
                                        {resumeData?.map((candidate, j) => {
                                            const value = candidate[criteria] || "-";  // Directly access `criteria` on `candidate`
                                            const isSummaryWithDash = criteria === 'summary' && value === '-';

                                            return (
                                                <td
                                                    key={j}
                                                    className={`text-left text-[15px] text-[#000000] p-5 border h-[100px] border-[#00B4D8] bg-[#F1FDFF] ${isSummaryWithDash ? 'align-middle' : (criteria === 'summary' ? 'align-top' : 'align-middle')
                                                        }`}
                                                >
                                                    {FormateUI(value, criteria)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-right max-w-[1150px] mx-auto mt-6">
                        <button
                            onClick={onEdit}
                            className="cursor-pointer max-sm:mb-3 sm:mr-3 bg-white hover:bg-[#00B4D8] w-[150px] font-semibold py-2 border border-[#00B4D8] rounded-full hover:text-white transition duration-200 text-black"
                        >
                            Edit
                        </button>
                        <button
                            className="cursor-pointer hover:bg-white w-[150px] font-semibold py-2 border border-[#00B4D8] rounded-full hover:text-black transition duration-200 text-white bg-[#00B4D8]"
                            onClick={onReset}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[-webkit-fill-available]  max-w-screen-lg w-[-webkit-fill-available] mx-auto p-3">
                    <div className="bg-white  p-8 text-center max-w-md w-[300px] ">
                        <div className="flex justify-center mb-4">
                            <ErrorAnimation />
                        </div>
                        <p className="text-red-400 text-xl font-semibold mb-2">Error!</p>
                        <p className="text-gray-700 text-sm mb-6">The resume contains incorrect or missing information. Please check and try again!</p>
                        <button
                            onClick={onReset}
                            className="bg-red-400 cursor-pointer hover:bg-red-500 text-white font-medium py-2 px-3 text-sm rounded-md transition duration-200 shadow-md hover:shadow-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}