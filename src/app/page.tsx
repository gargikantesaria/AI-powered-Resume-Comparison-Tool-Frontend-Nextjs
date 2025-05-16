import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 font-(family-name:--font-inter)">
      <div className="text-center max-w-[500px] mx-auto">
        <h1 className="text-[35px] leading-[35px] sm:leading-[58px] sm:text-[58px] font-extrabold text-gray-900 mb-4">
          Resume Analyzer AI Tool
        </h1>
        <p className=" text-[12.8px] text=[#000000] opacity-[57%] mb-6  font-normal ">
          An AI-powered tool to help HR teams quickly analyze multiple resumes against a job description.
          Upload 3 resumes, select custom criteria (skills, experience, certifications, etc.), and get
          an AI-driven comparison with ranked insights—making hiring decisions faster and smarter.
        </p>
        <Link href="/analyze" className="inline-block w-[200px] cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white  sm:font-medium px-6 py-3 rounded-[35px] transition">
          Get Started
        </Link>
      </div>
    </div>
  );
}
