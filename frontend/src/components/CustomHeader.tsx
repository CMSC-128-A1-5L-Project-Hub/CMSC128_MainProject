interface HeaderProps{
    title: string;
    right: React.ReactNode;
}

export default function Header({title, right } : { title: string; right?: React.ReactNode }) {
    return (
        <div className="bg-[#F6F2F4]">
            <div className='flex flex-row justify-between items-center mt-3'>
                <div className="flex flex-row justify-start items-center">
                    <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div>
                    <h1 className='font-serif font-bold italic text-[32px] lg:text-[33px] text-[#6B0F2B] pl-16 lg:p-0 capitalize'>{title}</h1>
                </div>
                {right && <div className="flex items-center gap-2 mr-5">{right}</div>}
            </div>
            <hr className="border-t border-[#6B0F2B] border-opacity-10 mt-1" />
        </div>
        
    )
}