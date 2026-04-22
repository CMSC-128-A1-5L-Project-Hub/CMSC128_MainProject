export default function Sidebar({ isOpen, onClose }){
    return (
        <>
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            >
            </div>

            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <button onClick={onClose} className="p-4 text-gray-500">X</button>

            </div>
        </>
    )
}