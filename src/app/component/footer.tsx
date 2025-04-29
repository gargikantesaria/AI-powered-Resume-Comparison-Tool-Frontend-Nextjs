import Image from "next/image";

export default function footer() {
    return (
        <footer className="p-4 mt-auto border-t border-(--secondary-blue) bg-white pt-4 text-black " >
            <div className="md:flex justify-between items-center">
                <div className="flex flex-wrap items-center gap-2">
                    <span className='font-medium footer-title'>Tech Used;</span>
                    <div className="bg-[#E4FBFF] p-1 rounded-md relative group cursor-pointer">
                        <Image src="assets/next-js.svg" alt="Next" className="w-5 h-5" height={15} width={15} />
                        <span className="absolute left-1/5 w-[66px] text-center -top-7 transform -translate-x-1/2 bg-(--primary-blue) text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200  inline-block">
                            Next.js
                        </span>
                    </div>
                    <div className="bg-[#E4FBFF] p-1 rounded-md relative group cursor-pointer">
                        <Image src="/assets/tailwind-css.svg" alt="Tailwind" height={20} width={20} className="w-5 h-5" />
                        <span className="absolute left-1/5 w-[66px] text-center -top-7 transform -translate-x-1/2 bg-(--primary-blue) text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200  inline-block">
                            Tailwind
                        </span>
                    </div>
                    <div className="bg-[#E4FBFF] p-1 rounded-md relative group cursor-pointer">
                        <img src="/assets/python.svg" alt="Pyton" className="w-5 h-5" />
                        <span className="absolute left-1/5 w-[66px] text-center -top-7 transform -translate-x-1/2 bg-(--primary-blue) text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200  inline-block">
                            Python
                        </span>
                    </div>
                    <div className="bg-[#E4FBFF] p-1 rounded-md relative group cursor-pointer">
                        <img src="/assets/document_AI.svg" alt=" Document AI" className="w-5 h-5" />
                        <span className="absolute left-1/5 w-[100px] text-center -top-7 transform -translate-x-1/2 bg-(--primary-blue) text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200  inline-block">
                            Document AI
                        </span>
                    </div>
                    <div className="bg-[#E4FBFF] p-1 rounded-md relative group cursor-pointer">
                        <img src="/assets/chatgpt.svg" alt="OpenAI" className="w-5 h-5" />
                        <span className="absolute left-1/5 w-[66px] text-center -top-7 transform -translate-x-1/2 bg-(--primary-blue) text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200  inline-block">
                            OpenAI
                        </span>
                    </div>
                    <div className="relative group bg-[#E4FBFF] p-1 rounded-md cursor-pointer">
                        <img src="/assets/langchain.svg" alt="Langchain" className="w-5 h-5" />
                        {/* Tooltip */}
                        <span className="absolute left-1/5 -top-7 transform -translate-x-1/2 bg-(--primary-blue) text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-auto inline-block">
                            Langchain
                        </span>
                    </div>
                </div>
            </div>
        </footer >
    )
}