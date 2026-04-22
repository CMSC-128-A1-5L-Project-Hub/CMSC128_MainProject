import House from "../../../assets/icons/house_icon.svg"

type HeroProps = {
    greeting: string
    name: string
    title: string
    subtitle: string
    type: "full" | "mini"
}

export default function HeroBanner({ 
    greeting, 
    name,
    title,
    subtitle,
    type="full"
    }: HeroProps) {
    return (
        <div className="rounded-2xl px-7 py-6 flex justify-between items-center overflow-hidden"
            style={{ background: "linear-gradient(to bottom right, #2A0410 0%, #6B0F2B 50%, #C05070 100%)"}}
        >
            <div>
                <p className="text-xs lg:text-sm font-medium tracking-widest uppercase text-[#C9973A]">
                    {greeting}, {name}
                </p>
                <h2 className={`text-white font-bold leading-snug
                        ${type === "full" ? "text-xl lg:text-3xl" : "text-lg lg:text-2xl"}
                    `}>
                    {title}
                </h2>
                <p className="text-xs lg:text-sm tracking-wide text-white/55">
                    {subtitle}
                </p>
            </div>
            {type === "full" ? (
                <div className="hidden md:block w-28 h-28 bg-white/10 rounded-xl shrink-0" />
            ):
                undefined
            }
            
            {/* Remove ko muna for now */}
            {/* <img
                src={House}
                className="hidden lg:inline relative right-[1%] translate-y-[0%] w-30 pointer-events-none"
            /> */}
        </div>
    )
}