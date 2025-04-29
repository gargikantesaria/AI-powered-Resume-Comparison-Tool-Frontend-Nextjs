# AI Resume Comparison Tool

An AI-powered resume comparison tool built with [Next.js](https://nextjs.org), designed to efficiently compare job descriptions with candidate resumes using advanced AI algorithms. This tool helps users quickly analyze and evaluate resumes, simplifying the process of matching candidates to job requirements.

## Features

- **Resume Upload**: Upload candidate resumes in PDF format to be parsed and analyzed.
- **Keyword Extraction**: Based on AI algorithm extract default keywords (skills, education, etc.) and also allowing users to add custom keywords for further extraction.
- **Summary Generation**: Generate a summary of the uploaded resume for a quick overview.
- **Relevancy Check**: Evaluate the relevancy of the resume based on extracted information and job description to determine how closely it aligns with it.
- **Resume Rating**: Rate the uploaded resume based on criteria and job description.
- **User-Friendly Interface**: Simple and intuitive interface for users to upload and analyze candidate resumes.

## 🛠 Tech Stack

- **Next.js**: React-based framework for building fast and modern web applications.
- **Tailwind CSS**: Utility-first CSS framework for designing responsive and customizable user interfaces.

## ⚠️ Limitations

1. Only PDF documents are supported for upload.
2. PDFs with more than 4 pages cannot be uploaded.

## ▶️ Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
