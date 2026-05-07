interface HeaderProps{
    title: string;
}

export default function Header({title} : HeaderProps) {
    return (
        <div className="bg-[#F6F2F4]">
            <div className='flex flex-row justify-start items-center mt-3'>
                <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div>
                <h1 className='font-serif font-bold italic text-[32px] lg:text-[33px] text-[#6B0F2B] pl-16 lg:p-0 capitalize'>{title}</h1>
            </div>
            <hr className="border-t border-[#6B0F2B] border-opacity-10 mt-1" />
        </div>
        
    )
}