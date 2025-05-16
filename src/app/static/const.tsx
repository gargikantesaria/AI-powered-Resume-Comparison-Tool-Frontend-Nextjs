export const staticValue = {
    resumeCriteria: [
        "Skills",
        "Experience",
        "Certifications",
        "Education",
        "Projects"
    ],
    resumeFormError: {
        emptyCorruptedFile: 'Uploaded file appears to be corrupted or empty. Please upload a valid file!',
        descriptionRequired: 'Please enter the job description!',
        criteriaRequired: 'Please select at least one criteria to compare from!',
        uploadResume: 'Please upload at least one resume!',
        maxUploadResume: 'You can upload maximum of 3 resumes!',
        resumeFileTypeError: 'Only .pdf files are allowed!',
        filesizeError: 'Each file must be 10MB or smaller!',
        customCompareFiledEmpty: 'Custom comparison fields cannot be empty!',
        fileSizeExceede: "The file should contain no more than 4 pages!"
    },
    allowedResumeFilesType: [
        "application/pdf",
    ],
    defaultKeyWordForAllComapreValue: ['summary', 'relevancy'],
    defaultKeyWords: ['skills', 'experience', 'certifications', 'education', 'projects']
}