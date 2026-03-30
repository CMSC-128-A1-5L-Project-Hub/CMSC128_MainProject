import { ChevronFirst } from "lucide-react"

export default function Sidebar({ }) {
    return (
        <aside className = "h-screen">
            <nav className = "h-full flex fex-col g-white border-r shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img 
                        src="../assets/logos/uble-placeholder.svg" 
                        className = "w-32"
                        alt="" 
                    />
                    <button className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"> 
                        <ChevronFirst />

                    </button>
                </div>

                <ul className = "flex-1 px-3">{children}</ul>

                <div className = "border-t flex p-3">
                    <img 
                        src="../assets/logos/uble-placeholder.svg" 
                        alt=""
                        className = "w-10 h-10 rounded-md"
                    />

                    <div className = {`
                        flex justify-between items-center
                        w-52 ml-3
                        `}>
                        <div className = "leading-4">
                            <h4 className ="font-sans font-bold">Liesl Chan</h4>
                            <span className="text-xs text-gray-600">johndoe@gmail.com</span>
                        </div>

                    </div>
                </div>


            </nav>

        </aside>
    )
}