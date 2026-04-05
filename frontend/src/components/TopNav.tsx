import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function TopNav({ title, onMenuClick }) {
    return (
        <nav className = "relative bg-[#F5ECF0] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#D9D9D9] after:pointer-events-none" >
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                        <button onClick={onMenuClick} className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                            <span className="absolute -inset-0.5" />
                            <Bars3Icon aria-hidden="false" className="block size-6 group-data-open:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                        </button>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-800 ml-12">{title}</h1>
                </div>
            </div>
        </nav>
    )
}