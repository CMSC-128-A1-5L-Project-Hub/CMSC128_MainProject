interface HeaderProps{
    title: string;
    left?: React.ReactNode;
    right?: React.ReactNode;
}

export default function Header({title, left, right } : HeaderProps) {
    return (
        <div className="bg-[#F6F2F4]">
            <div className='flex flex-row justify-between items-center mt-3'>
                <div className="flex flex-row justify-start items-center gap-2">
                    {left && <div className="pl-16 lg:pl-5">{left}</div>}
                    <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div>
                    <h1 className={`font-serif font-bold italic text-[32px] lg:text-[33px] text-[#6B0F2B] capitalize ${left ? 'lg:p-0' : 'pl-16 lg:p-0'}`}>{title}</h1>
                </div>
                {right && <div className="flex items-center gap-2 mr-5">{right}</div>}
            </div>
            <hr className="border-t border-[#6B0F2B] border-opacity-10 mt-1" />
        </div>

    )
}