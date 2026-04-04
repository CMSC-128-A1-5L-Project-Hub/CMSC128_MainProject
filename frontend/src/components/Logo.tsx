import logo from "../assets/logos/uble-placeholder.svg"

{/* Header with Logo and Name */}
export default function Logo({color = "black"}) {
    return(
        <header className="flex items-center gap-3">
            <img 
                src={logo}
                alt="UBLE Logo"
                className="w-10 h-10 object-contain"
            />
            <span style ={{color}} className="font-sans font-bold tracking-wide select-none">
                UBLE
            </span>
        </header>
    )
}