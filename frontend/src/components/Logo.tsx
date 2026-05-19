import logo from "../assets/logos/uble-placeholder.svg"

{/* Header with Logo and Name */}
export default function Logo({color = "black"}) {
    return(
        <header className="flex items-center gap-3">
            <div
                style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                }}
            >
                <img
                    src="/images/AppLogoo.png"
                    alt="Logo"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </div>
            <span style ={{color}} className="font-sans font-bold tracking-wide select-none">
                UBLE
            </span>
        </header>
    )
}