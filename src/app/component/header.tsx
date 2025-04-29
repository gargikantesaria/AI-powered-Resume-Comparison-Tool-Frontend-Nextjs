import Link from 'next/link';

export default function Header() {

    return (
        <header className="sticky top-0 z-50 bg-white text-right">
            <div className='text-right pe-8 '>
                <Link href='https://www.ownai.net/' target='blank' className='text-(--primary-blue) text-[25px]'>
                    own<b>AI</b>
                </Link>
            </div>
        </header>
    )
}