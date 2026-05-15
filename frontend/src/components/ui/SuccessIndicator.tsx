interface SuccessIndicatorProps {
    action: String
    success: boolean
}

const CheckSVG = (
    <svg fill="#ffffff" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z"></path></g></svg>
)

const CrossSVG = (
<svg fill="#ffffff" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M697.4 759.2l61.8-61.8L573.8 512l185.4-185.4-61.8-61.8L512 450.2 326.6 264.8l-61.8 61.8L450.2 512 264.8 697.4l61.8 61.8L512 573.8z"></path></g></svg>
)

export default function SuccessIndicator({action, success} : SuccessIndicatorProps){
    return success ? 
        (<div className="flex bg-white border p-4 transition-all items-center justify-center rounded-2xl shadow-md w-fit h-1/6 z-[50000]">
            <div className="rounded-full shrink-0 h-10 w-10 p-2 items-center justify-center bg-gradient-to-br from-[#1A7A4A] to-[#06361e]">
                {CheckSVG}    
            </div>
            <div className="font-semibold ml-3">
                {action} successful!
            </div>
        </div>) 
        : 
        (
            <div className="flex bg-white border p-4 transition-all items-center justify-center rounded-2xl shadow-md w-fit h-1/6 z-[50000]">
                <div className="rounded-full shrink-0 h-10 w-10 p-2 items-center justify-center bg-gradient-to-br from-[#9E2040] to-[#520a1c]">
                    {CrossSVG}    
                </div>
                <div className="flex flex-col ml-3">
                    <p className="font-bold">{action} failed!</p>
                    <p className="italic text-gray-500 text-sm -mt-1">Please try again.</p>
                </div>
            </div>
        )
}