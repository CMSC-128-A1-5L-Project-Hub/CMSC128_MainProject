import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import DormCard from "../../components/DormCardBrowse";
import AccommodationMap, { type AccommodationPin } from '../../components/AccommodationMapsBrowse'
import { BookMarked, Star } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import CustomHeader from '../../components/CustomHeader';
import HeroBanner from "@/components/dashboard/HeroBanner";
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import { useQuery } from "@tanstack/react-query"
import { api } from "../../api/axios"

const IconArrowNext = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const IconArrowBack = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);


interface HeroContent {
    greeting: string;
    name: string;
    title: string;
    subtitle: string;
}

type FilterContextType = {
    dormType: string;
    setDormType: (value: string) => void;
    minPrice: number;
    setMinPrice: (value: number) => void;
    maxPrice: number;
    setMaxPrice: (value: number) => void;
    roomType: string;
    setRoomType: (value: string) => void;
    starRating: number;
    setStarRating: (value: number) => void;
    onlyBookmarked: boolean;
    setOnlyBookmarked: (value: boolean) => void;
    searching: string;
    setSearching: (value: string) => void;
    filters: { [key: string]: boolean };
    setFilters: (value: { [key: string]: boolean }) => void;
};

export const filterContext = createContext<FilterContextType | undefined>(undefined);

export default function BrowsePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [profileLoading, setProfileLoading] = useState(true);

    // these are for filtering
    const [onlyBookmarked, setOnlyBookmarked] = useState(false);
    const [minPrice, setMinPrice] = useState(2500);
    const [maxPrice, setMaxPrice] = useState(7000);
    const [dormType, setDormType] = useState("All")
    const [roomType, setRoomType] = useState("All")
    const [starRating, setStarRating] = useState(3);
    const [studentNo, setStudentNo] = useState("");

    const [searching, setSearching] = useState("");

    const [isBelowSm, setIsBelowSm] = useState(false);

    const [searchExact, setSearchExact] = useState(false);

    const [name, setName] = useState("");
    const [filters, setFilters] = useState<{ [key: string]: boolean }>({
        "Near campus": false,
        "Pet friendly": false,
        "Near establishments": false,
        "Air-conditioned rooms": false,
        "Has study area": false,
        "24/7 security": false,
        "Has curfew": false,
        "Has canteen": false
    });

    const navigate = useNavigate()


    const {
        data: accommodations = [],
        isLoading: accommodationsLoading,
        isError: accommodationsError,
    } = useQuery({
        queryKey: ["accommodations", searchTerm, activeFilter],
        queryFn: async () => {
            const params: Record<string, any> = {};

            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            if (activeFilter !== "All") {
                if (activeFilter === "On-Campus") params.dormType = "On-Campus";
                else if (activeFilter === "Off-Campus") params.dormType = "Off-Campus";
                else if (activeFilter === "UPLB Partner") params.dormType = "UPLB Partner";
            }

            const res = await api.get("/accommodations", { params });
            console.log("ACCOMMODATIONS RAW RESPONSE:", res.data);
            console.log("ACCOMMODATIONS ARRAY:", res.data?.data?.data);
            console.log(Array.isArray(res.data))
            return Array.isArray(res.data) ? res.data : [];
        },
    });

    const { data: user, isLoading: isUserLoading, isError } = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await api.get("/me");
            setStudentNo(res.data.student.studentNumber)
            setName(`${res.data.student.fname} ${res.data.student.lname}`)
            return res.data;
        },
    });  

    const safeAccommodations = Array.isArray(accommodations) ? accommodations : [];


    useEffect(() => {
        if (isError) {
            navigate("/auth/signin");
        }
    }, [isError, navigate]);

    useEffect(() => {
        if (user && user.role !== "student") {
            navigate("/auth/signin");
        }
    }, [user, navigate]);


    // if (profileLoading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]">
    //             <p className="text-gray-600">Loading profile...</p>
    //         </div>
    //     );
    // }

    // if (isUserLoading) {
    //     return (
    //         <div className="flex items-center justify-center h-screen">
    //             <p>Loading...</p>
    //         </div>
    //     );
    // }

    const [dorms, setDorms] = useState<{ [key: number]: Dorm[] }>(
        {});

    const [mapAccommodations, setMapAccommodations] = useState<AccommodationPin[]>([]);

    type Dorm = {
        name: string;
        subtitle: string;
        meta: string;
        price: number;
        priceUnit: string;
        'featured chips': string[];
        rating: string;
        minPrice: number;
        maxPrice: number;
        invisible?: boolean;
        accommodationId: number;
        tags: string[];
    }

    useEffect(() => {
        const tempAccommodations: AccommodationPin[] = [];
        let temp: { [key: number]: Dorm[] } = {}
        let tempCounter = 0
        temp[tempCounter] = []
        for (let i = 0; i < accommodations.length; i++) {
            console.log(accommodations[i])
            if (i != 0 && i % 4 == 0) {
                tempCounter++;
                temp[tempCounter] = []
            }
            let { id, accommodationName, accommodationLocation, accommodationType, accommodationCapacity, tenantRestriction, latitude, longitude, walkingDistance, drivingDistance, bikingDistance, rooms, reviews, bookmarks, tags } = accommodations[i]
            let minimum = -1;
            let maximum = -1;

            const roomTypes = new Set();
            let rating = "6";
            let trueTags: string[] = []
            let tempTags: string[] = []
            let bookmarked = false

            Object.keys(filters).forEach((key: string) => {
                if (filters[key]) {
                    trueTags.push(key)
                }
            })

            Object.keys(tags).forEach((key: string) => {
                tempTags.push(tags[key].tagDetail);
            })

            rooms.forEach((element: { roomRent: Number; roomType: String }) => {
                roomTypes.add(element.roomType)
                let rent = Number(element.roomRent)
                if (minimum == -1) {
                    minimum = rent
                }

                if (maximum == -1) {
                    maximum = rent
                }

                if (Number(rent) < Number(minimum)) {
                    minimum = rent
                }

                if (Number(rent) > Number(maximum)) {
                    maximum = rent
                }
            });

            reviews.forEach((element: { rating: Number }) => {
                if (Number(element.rating) < Number(rating)) {
                    let temp = Number(element.rating);
                    rating = temp.toFixed(1)
                }
            })

            bookmarks.forEach((element: { studentNumber: string }) => {
                if (element.studentNumber === studentNo) {
                    bookmarked = true
                }
            })

            if (searching === "" || searching === accommodationName.toLowerCase()) {
                if (searching === accommodationName.toLowerCase()) {
                    setSearchExact(true)
                    setPageNumber(0)
                } else {
                    setSearchExact(false)
                }
                temp[tempCounter].push({ name: accommodationName, subtitle: accommodationLocation, meta: accommodationType, price: 3200, minPrice: minimum, maxPrice: maximum, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: rating, accommodationId: id, tags: tempTags })
            }

            if (!bookmarked && onlyBookmarked) {
                continue
            }

            if (Number(rating) < starRating || rating == "6") {
                continue
            }

            if (minimum < minPrice || maximum > maxPrice) {
                continue
            }

            if (dormType !== "All" && accommodationType !== dormType) {
                continue
            }

            if (roomType !== "All" && !(roomTypes.has(roomType))) {
                continue
            }

            if (trueTags.length != 0) {
                console.log(tempTags, accommodationName)
                let tagIncluded = false
                for (let i = 0; i < tempTags.length; i++) {
                    if (trueTags.includes(tempTags[i])) {
                        tagIncluded = true
                        break
                    }
                }
                if (!tagIncluded) {
                    continue
                }
            }


            tempAccommodations.push({
                accommodationId: id,
                accommodationName,
                accommodationLocation,
                accommodationType,
                accommodationCapacity,
                tenantRestriction,
                latitude,
                longitude,
                minRent: minimum,
                maxRent: maximum,
                walkingDistance,
                drivingDistance,
                bikingDistance,
                rating,
                price: 500,
                maxPrice: maximum,
                minPrice: minimum
            })

        }
        let final: { [key: number]: Dorm[] } = {}

        for (const key in temp) {
            const value = temp[key]
            if (value.length >= 1) {
                // if (value.length < 4 && !isBelowSm) {
                //     for (let i = value.length; i < 4; i++) {
                //         value.push({ name: "", subtitle: "", meta: "", price: 0, minPrice: 0, maxPrice: 0, priceUnit: '/ month', 'featured chips': [""], rating: "", invisible: true })
                //     }
                // }
                final[key] = value
            }
        }

        // if (Object.keys(final).length === 0) {
        //     final[0] = [];
        //     const value = final[0];
        //     for (let i = 0; i < 4; i++) {
        //         value.push({ name: "", subtitle: "", meta: "", price: 0, minPrice: 0, maxPrice: 0, priceUnit: '/ month', 'featured chips': [""], rating: "", invisible: true })
        //     }
        // }
        setDorms(final)
        setMapAccommodations(tempAccommodations)
    }, [accommodations, dormType, minPrice, maxPrice, roomType, starRating, onlyBookmarked, searching, isBelowSm, filters]);


    const [pageNumber, setPageNumber] = useState(0);
    const [pageLimits, setPageLimits] = useState([0, 2])

    // everything under here is for map
    const [searchParams, setSearchParams] = useSearchParams()

    // ─── Read filters from URL query params ──────────────────────────────────
    // This way filters set on the cards/browse page carry over to the map
    const search = searchParams.get('search') ?? ''
    const type = searchParams.get('type') ?? 'all'
    const restriction = searchParams.get('restriction') ?? 'all'
    const minRent = Number(searchParams.get('min_rent') ?? 0)
    const maxRent = Number(searchParams.get('max_rent') ?? 10000)
    const maxWalk = Number(searchParams.get('max_walk') ?? 60)
    const minCapacity = Number(searchParams.get('min_capacity') ?? 0)
    const stayType = searchParams.get('stay_type') ?? 'all'

    // ─── Apply filters ────────────────────────────────────────────────────────
    // const filtered = useMemo(() => {
    //     return mapAccommodations.filter((acc) => {
    //         console.log("hello", acc)
    //         const matchSearch =
    //             acc.accommodationName.toLowerCase().includes(search.toLowerCase()) ||
    //             acc.accommodationLocation.toLowerCase().includes(search.toLowerCase())
    //         const matchType = type === 'all' || acc.accommodationType === type
    //         const matchRestriction = restriction === 'all' || acc.tenantRestriction === restriction
    //         const matchRent = acc.minRent >= minRent && acc.maxRent <= maxRent
    //         const matchWalk = acc.walkingDistance <= maxWalk
    //         const matchCapacity = acc.accommodationCapacity >= minCapacity
    //         const matchStayType = stayType === 'all' || acc.stayType === stayType || acc.stayType === 'both'
    //         return true
    //     })
    // }, [search, type, restriction, minRent, maxRent, maxWalk, minCapacity, stayType])


    const centerId = searchParams.get('center')
    const centeredAccommodation = centerId
        ? mapAccommodations.find((a) => a.accommodationId === Number(centerId)) ?? null
        : null

    useEffect(() => {
        const media = window.matchMedia("(max-width: 639px)");

        const handleChange = (e: MediaQueryListEvent) => setIsBelowSm(e.matches);

        setIsBelowSm(media.matches);
        media.addEventListener("change", handleChange);

        return () => media.removeEventListener("change", handleChange);
    }, []);

    return <>
        <filterContext.Provider value={{ dormType, setDormType, minPrice, setMinPrice, maxPrice, setMaxPrice, roomType, setRoomType, starRating, setStarRating, onlyBookmarked, setOnlyBookmarked, searching, setSearching, filters, setFilters }}>
            <div className="flex w-full min-h-screen bg-[#F5EEF0]">
                <div className="relative z-[9999]">
                    <Sidebar role="student" />
                </div>
                <div className="flex flex-col items-start w-full min-h-screen">

                    <div className="w-full px-2 py-4 flex items-center justify-start gap-2">
                        <div className="w-2 h-10 bg-[#7A0F23] rounded-full"></div>
                        <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-[#7A0F23]">
                            Browse Rooms
                        </h1>
                    </div>

                    <div className="flex flex-col w-full p-2 items-center">
                        <div className="flex flex-col w-full h-full justify-center items-start p-2 rounded-lg bg-gradient-to-r from-[#4A0E1C] via-[#7A162D] to-[#4A0E1C] shadow-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80">
                                Good Day, {name}
                            </span>
                            <h2 className="font-semibold tracking-tight text-white">
                                Check out new accommodations
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center items-start w-full gap-2 md:gap-0">

                        {/* first half */}
                        <div className="flex flex-col justify-center items-center w-full gap-2 md:w-1/2 shrink-0">
                            {/* search bar */}
                            <div className="flex w-full justify-center items-center px-4 sm:px-6 lg:px-12">
                                <SearchBar></SearchBar>
                            </div>

                            {/* dorm cards and buttons */}
                            <div className="flex w-full justify-center items-center p-4 gap-2">
                                {Object.keys(dorms).length > 0 && !searchExact && (
                                    <div className="flex justify-center items-center relative z-50">
                                        <button
                                            onClick={() => {
                                                let counter = pageNumber;
                                                if (counter == 0) {
                                                    counter = Object.keys(dorms).length - 1;
                                                } else {
                                                    counter--;
                                                }

                                                if (counter % 2 == 0 && counter != Object.keys(dorms).length - 1) {
                                                    let temp = [...pageLimits];
                                                    if (temp[0] - 2 >= 0) {
                                                        temp[0] -= 2;
                                                        temp[1] -= 2;
                                                        setPageLimits(temp);
                                                    }
                                                } else if (counter % 2 == 0 && counter == Object.keys(dorms).length - 1) {
                                                    let max = Object.keys(dorms).length;
                                                    max = max % 2 == 0 ? max : max + 1;
                                                    let temp = [max - 2, max];
                                                    setPageLimits(temp);
                                                }

                                                setPageNumber(counter);
                                            }}
                                            className="rounded-full bg-gradient-to-b from-[#9b3b55] to-[#5a1e2f] flex items-center justify-center shadow-lg"
                                        >
                                            <span className="text-white text-3xl">{'<'}</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex">
                                    {<div className="flex" style={{ transform: `translateX(-${100 * pageNumber}%)`, transition: 'transform 500ms ease-in-out', }}>

                                        {Object.keys(dorms).length === 0 ? (
                                            <div className="w-full flex items-center justify-center">
                                                <div className="flex justify-center w-full max-w-[100%] h-[300px] md:h-[600px]">
                                                    <div className="col-span-2 flex items-center justify-center py-10 text-gray-500 text-lg">
                                                        No searches found
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            Object.keys(dorms).map((key, index) => {
                                                const hasOnePage = Object.keys(dorms[Number(key)]).length === 1;

                                                if (hasOnePage && pageNumber == index) {
                                                    return (
                                                        <div className="w-full shrink-0 flex items-center transition-opacity duration-500 opacity-100">
                                                            <div className="flex justify-center w-full max-w-[100%] h-[300px] md:h-[600px]">
                                                                <div className="flex items-center justify-center">
                                                                    {dorms[Number(key)].map((value) => {
                                                                        return <div className="w-full flex items-center justify-center">
                                                                            <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { navigate(`/accommodations/${value.accommodationId}`) }} />
                                                                        </div>
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                else if (hasOnePage && pageNumber != index) {
                                                    return (
                                                        <div className="w-full shrink-0 flex items-center transition-opacity duration-500 opacity-0">
                                                            <div className="flex justify-center w-full max-w-[100%] h-[300px] md:h-[600px]">
                                                                <div className="flex items-center justify-center">
                                                                    {dorms[Number(key)].map((value) => {
                                                                        return <div className="w-full flex items-center justify-center">
                                                                            <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { }} />
                                                                        </div>
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }


                                                if (pageNumber == index) {
                                                    return (
                                                        <div className="w-full shrink-0 flex items-center transition-opacity duration-500 opacity-100">
                                                            <div className={`grid ${hasOnePage ? "grid-cols-1" : "grid-cols-2"} gap-6 w-full mx-auto justify-items-center`}>
                                                                {dorms[Number(key)].map((value) => {
                                                                    return <div className="w-full flex items-center justify-center">
                                                                        <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { navigate(`/accommodations/${value.accommodationId}`) }} />
                                                                    </div>
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="w-full shrink-0 flex items-center transition-opacity duration-500 opacity-0">
                                                            <div className="grid grid-cols-2 gap-6 w-full mx-auto justify-items-center">
                                                                {dorms[Number(key)].map((value) => {
                                                                    console.log(dorms[Number(key)].length)
                                                                    return <div className="w-full flex items-center justify-center">
                                                                        <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { }} />
                                                                    </div>
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })
                                        )}
                                    </div>}

                                </div>

                                {Object.keys(dorms).length > 0 && !searchExact &&
                                    (<div className="flex justify-center items-center relative z-50">
                                        <button onClick={() => {

                                            let counter = pageNumber
                                            if (counter == Object.keys(dorms).length - 1) {
                                                counter = 0
                                            } else {
                                                counter++
                                            }


                                            if (counter % 2 == 0 && counter != 0) {
                                                let temp = [...pageLimits]
                                                let max = Object.keys(dorms).length
                                                max = max % 2 == 0 ? max : max + 1


                                                if (temp[1] + 2 <= max) {
                                                    temp[0] += 2
                                                    temp[1] += 2
                                                    setPageLimits(temp)
                                                }
                                            } else if (counter % 2 == 0 && counter == 0) {
                                                let temp = [0, 2]
                                                setPageLimits(temp)
                                            }

                                            setPageNumber(counter)
                                        }} className="rounded-full bg-gradient-to-b from-[#9b3b55] to-[#5a1e2f] flex items-center justify-center shadow-lg">
                                            <span className="text-white text-3xl">{'>'}</span>
                                        </button>
                                    </div>)}
                            </div>

                            <div className="flex justify-end items-center w-[70%] gap-2">
                                {pageLimits[0] != 0 &&
                                    <button onClick={() => {
                                        let temp = [...pageLimits]
                                        if (temp[0] - 2 >= 0) {
                                            temp[0] -= 2
                                            temp[1] -= 2
                                            setPageLimits(temp)
                                            setPageNumber(temp[1] - 1)
                                        }
                                    }} className="flex w-[10%] items-center justify-center rounded-xl bg-white text-lg font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]">
                                        {'<'}
                                    </button>
                                }
                                {
                                    Object.keys(dorms).map((value, index) => {
                                        let start = pageLimits[0]
                                        let end = pageLimits[1]
                                        let current = parseInt(value) + 1
                                        if (current >= start && current <= end) {
                                            return <button onClick={() => {
                                                setPageNumber(current - 1)
                                            }} className={`flex w-[10%] items-center justify-center rounded-xl ${pageNumber == index ? '' : 'border border-[#E8D4E2]'} ${pageNumber == index ? 'bg-[#7A162D]' : 'bg-white'} text-lg font-semibold ${pageNumber == index ? 'text-white' : 'text-[#654050]'} shadow-md hover:bg-[#7A162D] hover:text-white`}>
                                                {current}
                                            </button>
                                        }
                                    })
                                }
                                {
                                    pageLimits[1] < Object.keys(dorms).length &&
                                    <button onClick={() => {
                                        let temp = [...pageLimits]
                                        let max = Object.keys(dorms).length
                                        max = max % 2 == 0 ? max : max + 1

                                        if (temp[1] + 2 <= max) {
                                            temp[0] += 2
                                            temp[1] += 2
                                            setPageLimits(temp)
                                            setPageNumber(temp[0] - 1)
                                        }
                                    }} className="flex w-[10%] items-center justify-center rounded-xl bg-white text-lg font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]">
                                        {'>'}
                                    </button>
                                }

                            </div>

                        </div>

                        {/* second half */}
                        <div className="flex justify-center items-start w-full h-[700px] md:w-1/2 md:h-[800px] shrink-0 relative z-50 bg-[radial-gradient(circle_at_center,#F5EEF0)]">
                            <div className="flex flex-col justify-center items-center bg-white rounded-lg p-4 shadow-md w-[90%] h-full gap-2">

                                <AccommodationMap
                                    accommodations={mapAccommodations}
                                    centeredAccommodation={centeredAccommodation}
                                    onCardClick={(acc) => navigate(`/accommodations/${acc.accommodationId}`)}
                                />


                                <div className="flex justify-center items-center w-[90%] gap-3">
                                    <Form></Form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div >
            </div>
        </filterContext.Provider>
    </>
}

function SearchBar() {
    const context = useContext(filterContext);
    if (!context) {
        throw new Error("FilterContext must be used within a Provider");
    }
    const { setSearching } = context

    return <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center bg-white rounded-2xl shadow-md px-4 py-2 border border-gray-200">
            <div className="flex items-center flex-1 space-x-2">

                <svg className="w-5 h-5 text-[#8A2A45]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                    id="search-bar"
                    type="text"
                    placeholder="Search dormitory name"
                    className="w-full outline-none text-gray-700 rounded-xl placeholder-[#C8B0B8]"
                />
            </div>

            <button onClick={() => {
                const input = document.getElementById("search-bar") as HTMLInputElement
                setSearching((input.value.trim()).toLowerCase())
            }} className="flex items-center space-x-2 bg-gradient-to-r from-[#6B0F2B] to-[#8A1C3D] hover:from-[#7A162D] hover:to-[#A3264A] text-white px-5 py-2 rounded-full transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Search</span>
            </button>

        </div>
    </div>
}

function Form() {

    const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A7080", marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" };


    const context = useContext(filterContext);
    if (!context) {
        throw new Error("FilterContext must be used within a Provider");
    }
    const { dormType, setDormType, minPrice, setMinPrice, maxPrice, setMaxPrice, roomType, setRoomType, starRating, setStarRating, onlyBookmarked, setOnlyBookmarked, filters, setFilters } = context

    const [newFilter, setNewFilter] = useState("")
    const [modal, setModal] = useState(false);

    const originalFilters = {
        "Near campus": false,
        "Pet friendly": false,
        "Near establishments": false,
        "Air-conditioned rooms": false,
        "Has study area": false,
        "24/7 security": false,
        "Has curfew": false,
        "Has canteen": false
    }

    return (
        <>
            <div className="flex flex-col w-full">
                <div className="flex flex-col items-end">
                    <button
                        className="group flex flex-col items-center justify-start w-fit"
                        onClick={() => {
                            setFilters(originalFilters)
                            setStarRating(3)
                            setOnlyBookmarked(false)
                            setDormType("All")
                            setRoomType("All")
                            setMinPrice(2500)
                            setMaxPrice(7000)
                            const dorm_type = document.getElementById("dorm-type") as HTMLSelectElement | null;
                            const room_type = document.getElementById("room-type") as HTMLSelectElement | null;

                            if (dorm_type) {
                                dorm_type.selectedIndex = 0;
                            }

                            if (room_type) {
                                room_type.selectedIndex = 0;
                            }
                        }}
                    >

                        <span className="text-xs font-bold text-[#8a7686] group-hover:text-[#7A162D] transition-colors">
                            Reset Filters
                        </span>


                        <div className="w-full h-[1.5px] bg-[#d2c2ce] mt-[-2px] group-hover:bg-[#7A162D] transition-colors" />
                    </button>
                </div>
                <div className="flex w-full">
                    <div className="flex flex-col justify-center w-[50%] md:gap-3 p-2">
                        <div className='flex flex-col'>
                            <p className="text-[10px] sm:text-sm font-semibold uppercase text-[#9a7080] tracking-widest mb-1 sm:mb-2">
                                SHOW FAVORITES ONLY
                            </p>

                            <div className="flex items-center justify-center rounded-2xl border bg-pink-50 p-2">
                                <div className="flex items-center gap-3">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white" stroke="#6B0F2B" strokeWidth="2">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6.5 5.5 5.5 0 0121.5 12C19 16.5 12 21 12 21z"
                                        />
                                    </svg>
                                    <div className="flex items-center gap-3 w-[80%]">
                                        <div className="flex flex-col h-full">

                                            <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                                Saved Rooms
                                            </p>

                                            <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">
                                                Show only your saved dorms
                                            </p>
                                        </div>
                                    </div>
                                </div>




                                <button className={`toggle-btn ${onlyBookmarked ? 'toggled' : ''} `} onClick={() => setOnlyBookmarked(!onlyBookmarked)}>
                                    <div className="thumb w-[10px]"></div>
                                </button>

                            </div>
                        </div>

                        {/* <hr className="border-gray-200" /> */}

                        <div className="flex flex-col">

                            <p className="text-[11px] sm:text-sm font-semibold text-[#9a7080] tracking-widest mb-1 sm:mb-2">
                                DORM TYPE
                            </p>

                            <div className="relative w-full">
                                <Dropdown
                                    title="No. of Items"
                                    items={[
                                        { label: "All Types", href: "" },
                                        { label: "Apartment", href: "" },
                                        { label: "Dormitory", href: "" },
                                        { label: "Boarding House", href: "" },
                                    ]}
                                    showTitle= {false}
                                    direction='down'
                                    widthClass="w-full"
                                    titleClass="text-[10px] lg:text-[11px]"
                                    selectedClass="text-[12px] lg:text-[13px] text-left block pl-2"
                                    //onSelect={(label) => { setRows(parseInt(label, 10)); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* <hr className="border-gray-200" /> */}

                        <div className='flex flex-col'>

                            <p className="text-[11px] sm:text-sm font-semibold text-[#9a7080] tracking-widest mb-1 sm:mb-2">
                                ROOM TYPE
                            </p>

                            <div className="relative w-full">
                                <Dropdown
                                    title="No. of Items"
                                    items={[
                                        { label: "All", href: "" },
                                        { label: "Single", href: "" },
                                        { label: "Shared", href: "" },
                                        { label: "Studio", href: "" },
                                    ]}
                                    showTitle= {false}
                                    direction='down'
                                    widthClass="w-full"
                                    titleClass="text-[10px] lg:text-[11px]"
                                    selectedClass="text-[12px] lg:text-[13px] text-left block pl-2"
                                    //onSelect={(label) => { setRows(parseInt(label, 10)); setCurrentPage(1); }}
                                />
                            </div>
                        </div>


                        <div className="flex flex-col justify-center items-start">

                            <p className="text-[11px] sm:text-sm font-semibold text-[#9a7080] tracking-widest mb-1 sm:mb-2">
                                MIN RATING
                            </p>

                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">

                                <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => {
                                        const filled = index < starRating;

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setStarRating(index + 1)}
                                                className="transition-transform active:scale-90 p-0 leading-none"
                                            >
                                                <Star
                                                    size={20}
                                                    className="sm:w-6 sm:h-6 transition-colors duration-200"
                                                    fill={filled ? '#C0934B' : '#E5D5DB'}
                                                    stroke="none"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled
                                    type="button"
                                    className="flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-pink-900"
                                >
                                    <span>{starRating}</span>
                                    <Star size={12} className="sm:w-4 sm:h-4 text-pink-900" fill="currentColor" stroke="none" />
                                    <span>+</span>
                                </button>

                            </div>
                        </div>


                    </div>
                    <div className="flex flex-col justify-center w-[50%] md:gap-3 p-2">
                        <div className="flex flex-col">
                            <p className="text-[11px] sm:text-sm font-semibold text-[#9a7080] tracking-widest mb-1 sm:mb-2">
                                PRICE RANGE
                            </p>
                            <div className="px-3 py-3 sm:px-4 sm:py-4">

                                {/* Price row */}
                                <div className="flex items-center justify-between mb-2 sm:mb-3">

                                    <span className="bg-[#f5f0f2] rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-[#6B0F2B] font-sans">
                                        ₱{minPrice.toLocaleString()}
                                    </span>

                                    <span className="text-[10px] sm:text-xs text-gray-400 font-sans">
                                        to
                                    </span>

                                    <span className="bg-[#f5f0f2] rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-[#6B0F2B] font-sans">
                                        ₱{maxPrice.toLocaleString()}
                                    </span>

                                </div>

                                {/* Slider */}
                                <div className="px-1 sm:px-2">
                                    <DualRangeSlider
                                        minVal={minPrice}
                                        maxVal={maxPrice}
                                        onMinChange={setMinPrice}
                                        onMaxChange={setMaxPrice}
                                        dataMin={2500}
                                        dataMax={10000}
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-col">
                            <p className="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-wide mb-1 sm:mb-2">
                                OTHERS
                            </p>
                            <div className="flex flex-wrap w-full gap-1">
                                {
                                    Object.keys(filters).map((value) => (
                                        <button onClick={() => {
                                            let tempFilters = { ...filters }
                                            tempFilters[value] = !tempFilters[value]
                                            setFilters(tempFilters)
                                        }} className={`
                                        px-2 py-0.5 text-[10px]
                                        sm:px-3 sm:py-1 sm:text-xs
                                        md:px-3.5 md:py-1.5 md:text-sm
                        
                                        rounded-full font-medium border
                                        transition active:scale-95
                                        whitespace-nowrap touch-manipulation
                        
                                        ${filters[value]
                                                ? "bg-[#7A0F23] text-white border-[#7A0F23]"
                                                : "bg-transparent text-[#7A0F23] border-[#7A0F23]"
                                            }
                                    `}>
                                            {value}
                                        </button>
                                    ))
                                }
                                {/* <button onClick={() => { setModal(true) }} className={`px-3 py-1 rounded-full font-medium transition border-2 border-dashed bg-transparent text-[#7A0F23]/60 border-[#7A0F23]/60`}>
                                    + Add more
                                </button> */}
                                {modal && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center">

                                        {/* Backdrop Blur */}
                                        <div
                                            className="absolute inset-0 bg-[#4A0E1C]/40 backdrop-blur-sm"
                                            onClick={() => {
                                                setModal(modal => !modal)
                                            }}
                                        />

                                        {/* Modal Card */}
                                        <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl mx-4">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-serif italic text-[#7A162D]">Add filter</h2>
                                                <button
                                                    onClick={() => {
                                                        setModal(modal => !modal)
                                                    }}
                                                    className="text-gray-400 hover:text-maroon-800"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <input
                                                    onChange={(e) => {
                                                        setNewFilter(e.target.value)
                                                    }}
                                                    type="text"
                                                    placeholder="New Filter"
                                                    className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7A162D]/20"
                                                />

                                                <button onClick={() => {
                                                    let tempFilters = { ...filters }
                                                    tempFilters[newFilter] = true
                                                    setFilters(tempFilters)
                                                    setModal(modal => !modal)
                                                }}
                                                    className="w-full py-4 mt-4 bg-[#7A162D] text-white rounded-2xl font-semibold shadow-lg shadow-maroon-200 hover:bg-[#5a1021] transition-colors">
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function DualRangeSlider({
    minVal, maxVal,
    onMinChange, onMaxChange,
    dataMin, dataMax,
}: {
    minVal: number; maxVal: number;
    onMinChange: (v: number) => void; onMaxChange: (v: number) => void;
    dataMin: number; dataMax: number;
}) {
    const STEP = 100;
    const range = dataMax - dataMin;
    const minPct = ((minVal - dataMin) / range) * 100;
    const maxPct = ((maxVal - dataMin) / range) * 100;

    return (
        <div style={{ position: "relative", width: "100%", height: 28 }}>
            {/* Track */}
            <div style={{
                position: "absolute",
                top: "50%", left: 0, right: 0,
                height: 6,
                borderRadius: 99,
                background: "#ede8ea",
                transform: "translateY(-50%)",
            }} />

            {/* Fill */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: `${minPct}%`,
                width: `${maxPct - minPct}%`,
                height: 6,
                borderRadius: 99,
                background: "linear-gradient(90deg, #6B0F2B, #B5344F)",
                transform: "translateY(-50%)",
            }} />

            {/* Min Thumb */}
            <input
                type="range"
                min={dataMin}
                max={dataMax}
                step={STEP}
                value={minVal}
                onChange={(e) => onMinChange(Number(e.target.value))}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: 28,
                    transform: "translateY(-50%)",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                    WebkitAppearance: "none",
                }}
            />

            {/* Max Thumb */}
            <input
                type="range"
                min={dataMin}
                max={dataMax}
                step={STEP}
                value={maxVal}
                onChange={(e) => onMaxChange(Number(e.target.value))}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: 28,
                    transform: "translateY(-50%)",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                    WebkitAppearance: "none",
                }}
            />

            {/* Visual Circles */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: `${minPct}%`,
                transform: "translate(-50%, -50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "white",
                border: "3px solid #6B0F2B",
                pointerEvents: "none",
                zIndex: 5,
            }} />

            <div style={{
                position: "absolute",
                top: "50%",
                left: `${maxPct}%`,
                transform: "translate(-50%, -50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "white",
                border: "3px solid #6B0F2B",
                pointerEvents: "none",
                zIndex: 5,
            }} />
        </div>
    );
}


// export default function BrowsePage() {
//     const heroContent: HeroContent = {
//         name: "Ana Reyes",
//         greeting: "Good Day",
//         title: "Browse available rooms",
//         subtitle: "Browse available accommodations and apply in just a few clicks",
//     }; 
    
//     const [dorms, setDorms] = useState<{ [key: number]: Dorm[] }>(
//         {
//             0: [
//                 { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//             ], 1: [
//                 { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//             ], 2: [
//                 { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//                 { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
//             ]
//         });

//     const [pageNumber, setPageNumber] = useState(0);
//     const [pageLimits, setPageLimits] = useState([0, 2])

//     // everything under here is for map
//     const navigate = useNavigate()
//     const [searchParams, setSearchParams] = useSearchParams()

//     // ─── Read filters from URL query params ──────────────────────────────────
//     // This way filters set on the cards/browse page carry over to the map
//     const search = searchParams.get('search') ?? ''
//     const type = searchParams.get('type') ?? 'all'
//     const restriction = searchParams.get('restriction') ?? 'all'
//     const minRent = Number(searchParams.get('min_rent') ?? 0)
//     const maxRent = Number(searchParams.get('max_rent') ?? 10000)
//     const maxWalk = Number(searchParams.get('max_walk') ?? 60)
//     const minCapacity = Number(searchParams.get('min_capacity') ?? 0)
//     const stayType = searchParams.get('stay_type') ?? 'all'

//     // ─── Apply filters ────────────────────────────────────────────────────────
//     const filtered = useMemo(() => {
//         return MOCK_ACCOMMODATIONS.filter((acc) => {
//             const matchSearch =
//                 acc.accommodationName.toLowerCase().includes(search.toLowerCase()) ||
//                 acc.accommodationLocation.toLowerCase().includes(search.toLowerCase())
//             const matchType = type === 'all' || acc.accommodationType === type
//             const matchRestriction = restriction === 'all' || acc.tenantRestriction === restriction
//             const matchRent = acc.minRent >= minRent && acc.maxRent <= maxRent
//             const matchWalk = acc.walkingDistance <= maxWalk
//             const matchCapacity = acc.accommodationCapacity >= minCapacity
//             const matchStayType = stayType === 'all' || acc.stayType === stayType || acc.stayType === 'both'
//             return matchSearch && matchType && matchRestriction && matchRent && matchWalk && matchCapacity && matchStayType
//         })
//     }, [search, type, restriction, minRent, maxRent, maxWalk, minCapacity, stayType])

//     const centerId = searchParams.get('center')
//     const centeredAccommodation = centerId
//         ? MOCK_ACCOMMODATIONS.find((a) => a.accommodationId === Number(centerId)) ?? null
//         : null

//     const [isBelowSm, setIsBelowSm] = useState(false);

//     useEffect(() => {
//         const media = window.matchMedia("(max-width: 639px)");

//         const handleChange = (e: MediaQueryListEvent) => setIsBelowSm(e.matches);

//         setIsBelowSm(media.matches);
//         media.addEventListener("change", handleChange);

//         return () => media.removeEventListener("change", handleChange);
//     }, []);

//     return <>
//         <div className="flex flex-row w-full min-h-screen bg-[#F5EEF0]">
//             <div className="relative z-[9999]">
//                 <Sidebar role="student" />
//             </div>

//             <div className="flex flex-col w-full">
//                 <CustomHeader
//                         title="Browse Rooms"></CustomHeader>
//                 <div className="flex flex-col items-start w-full min-w-0 min-h-screen">
                    
//                     <div className="w-full p-6">
//                         <HeroBanner
//                             greeting={heroContent.greeting}
//                             name={heroContent.name}
//                             title={heroContent.title}
//                             subtitle={heroContent.subtitle}
//                             type="mini"
//                         />
//                     </div>
                    

//                     <div className="flex flex-wrap justify-center items-start w-full gap-2 mb-6 md:gap-0">

//                         {/* first half */}
//                         <div className="flex flex-col justify-center items-center w-full gap-2 md:w-1/2 shrink-0">
//                             {/* search bar */}
//                             <div className="flex w-full justify-center items-center px-4 sm:px-6 lg:px-12">
//                                 <SearchBar></SearchBar>
//                             </div>

//                             {/* dorm cards and buttons */}
//                             <div className="flex w-full justify-center items-center p-4 gap-2">
//                                 <div className="flex justify-center items-center relative z-50">
//                                     <button onClick={() => {
//                                         let counter = pageNumber
//                                         if (counter == 0) {
//                                             counter = Object.keys(dorms).length - 1
//                                         } else {
//                                             counter--
//                                         }

//                                         if (counter % 2 == 0 && counter != Object.keys(dorms).length - 1) {
//                                             let temp = [...pageLimits]
//                                             if (temp[0] - 2 >= 0) {
//                                                 temp[0] -= 2
//                                                 temp[1] -= 2
//                                                 setPageLimits(temp)
//                                             }
//                                         } else if (counter % 2 == 0 && counter == Object.keys(dorms).length - 1) {
//                                             let max = Object.keys(dorms).length
//                                             max = max % 2 == 0 ? max : max + 1
//                                             let temp = [max - 2, max]
//                                             setPageLimits(temp)
//                                         }

//                                         setPageNumber(counter)
//                                     }} className="rounded-full p-3 bg-gradient-to-b from-[#9b3b55] to-[#5a1e2f] flex items-center justify-center shadow-lg">
//                                         <IconArrowBack className="w-6 h-6" />
//                                     </button>
//                                 </div>

//                                 <div className="flex">
//                                     <div
//                                         className="flex"
//                                         style={{
//                                             transform: `translateX(-${100 * pageNumber}%)`,
//                                             transition: 'transform 500ms ease-in-out',
//                                         }}
//                                     >

//                                         {Object.keys(dorms).map((key, index) => {
//                                             console.log(isBelowSm)
//                                             if (pageNumber == index) {
//                                                 return <div className={`w-full shrink-0 flex items-center transition-opacity duration-500 ${"opacity-500"
//                                                     }`}>
//                                                     <div className="grid grid-cols-2 gap-6 w-full mx-auto justify-items-center">
//                                                         {dorms[Number(key)].map((value) => (
//                                                             <div className="w-full flex items-center justify-center">
//                                                                 <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { }} />
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             } else {
//                                                 return <div className={`w-full h-full shrink-0 transition-opacity duration-500 ${"opacity-0"
//                                                     }`}>
//                                                     <div className="grid grid-cols-2 gap-4 w-full h-full mx-auto justify-items-center">
//                                                         {dorms[Number(key)].map((value) => (
//                                                             <div className="w-full flex items-center justify-center">
//                                                                 <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { }} />
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             }

//                                         })}
//                                     </div>

//                                 </div>

//                                 <div className="flex justify-center items-center relative z-20">
//                                     <button onClick={() => {

//                                         let counter = pageNumber
//                                         if (counter == Object.keys(dorms).length - 1) {
//                                             counter = 0
//                                         } else {
//                                             counter++
//                                         }

//                                         console.log(counter)
//                                         if (counter % 2 == 0 && counter != 0) {
//                                             let temp = [...pageLimits]
//                                             let max = Object.keys(dorms).length
//                                             max = max % 2 == 0 ? max : max + 1


//                                             if (temp[1] + 2 <= max) {
//                                                 temp[0] += 2
//                                                 temp[1] += 2
//                                                 setPageLimits(temp)
//                                             }
//                                         } else if (counter % 2 == 0 && counter == 0) {
//                                             let temp = [0, 2]
//                                             setPageLimits(temp)
//                                         }

//                                         setPageNumber(counter)
//                                     }} className="rounded-full p-3 bg-gradient-to-b from-[#9b3b55] to-[#5a1e2f] flex items-center justify-center shadow-lg">
//                                         <IconArrowNext className="w-6 h-6" />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end items-center w-[70%] gap-2">
//                                 {pageLimits[0] != 0 &&
//                                     <button onClick={() => {
//                                         let temp = [...pageLimits]
//                                         if (temp[0] - 2 >= 0) {
//                                             temp[0] -= 2
//                                             temp[1] -= 2
//                                             setPageLimits(temp)
//                                             setPageNumber(temp[1] - 1)
//                                         }
//                                     }} className="flex w-[10%] items-center justify-center rounded-xl bg-white text-lg font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]">
//                                         {'<'}
//                                     </button>
//                                 }
//                                 {
//                                     Object.keys(dorms).map((value, index) => {
//                                         let start = pageLimits[0]
//                                         let end = pageLimits[1]
//                                         let current = parseInt(value) + 1
//                                         if (current >= start && current <= end) {
//                                             return <button onClick={() => {
//                                                 setPageNumber(current - 1)
//                                             }} className={`flex w-[10%] items-center justify-center rounded-xl ${pageNumber == index ? '' : 'border border-[#E8D4E2]'} ${pageNumber == index ? 'bg-[#7A162D]' : 'bg-white'} text-lg font-semibold ${pageNumber == index ? 'text-white' : 'text-[#654050]'} shadow-md hover:bg-[#7A162D] hover:text-white`}>
//                                                 {current}
//                                             </button>
//                                         }
//                                     })
//                                 }
//                                 {
//                                     pageLimits[1] < Object.keys(dorms).length &&
//                                     <button onClick={() => {
//                                         let temp = [...pageLimits]
//                                         let max = Object.keys(dorms).length
//                                         max = max % 2 == 0 ? max : max + 1

//                                         if (temp[1] + 2 <= max) {
//                                             temp[0] += 2
//                                             temp[1] += 2
//                                             setPageLimits(temp)
//                                             setPageNumber(temp[0] - 1)
//                                         }
//                                     }} className="flex w-[10%] items-center justify-center rounded-xl bg-white text-lg font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]">
//                                         {'>'}
//                                     </button>
//                                 }

//                             </div>

//                         </div>

//                         {/* second half */}
//                         <div className="flex justify-center rounded-xl items-start w-full h-[70%] md:w-1/2 md:h-full shrink-0 relative bg-[radial-gradient(circle_at_center,#F5EEF0)]">
//                             <div className="flex flex-col justify-center items-center bg-white rounded-2xl p-4 shadow-md w-[90%] h-full gap-2">

//                                 <AccommodationMap
//                                     accommodations={filtered}
//                                     centeredAccommodation={centeredAccommodation}
//                                     onCardClick={(acc) => navigate(`/accommodations/${acc.accommodationId}`)}
//                                 />


//                                 <div className="flex justify-center items-center w-[90%] gap-3">
//                                     <Form></Form>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div >
//             </div>
//         </div>
//     </>
// }