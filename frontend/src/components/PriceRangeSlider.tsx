import React, { useCallback, useEffect, useState, useRef } from 'react'

const valueCSS = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    gap: "2px",
    paddingTop: "10px",
};

type PriceRangeSliderProps = {
    min: number;
    max: number;
    trackColor?: string;
    rangeColor?: string;
    onChange: (value: { min: number; max: number }) => void;
    valueStyle?: React.CSSProperties;
    width?: string;
    currencyText?: string;
    mobileScreen?: boolean;
    snapPoints?: number[];
    snapThreshold?: number;
    thumbSize?: number; // in px, default 16
};

let DEFAULT_SNAP_POINTS = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000];

const snapToNearest = (value: number, points: number[], threshold: number) => {
    const closest = points.reduce((a, b) =>
        Math.abs(b - value) < Math.abs(a - value) ? b : a
    );
    return Math.abs(closest - value) <= threshold ? closest : value;
};

const PriceRangeSlider = ({
    min,
    max,
    trackColor = "#ffffff",
    onChange,
    rangeColor = "#9A7080",
    valueStyle = valueCSS,
    width = "300px",
    currencyText = "$",
    mobileScreen = false,
    snapPoints = DEFAULT_SNAP_POINTS,
    snapThreshold = 200,
    thumbSize = 10,
}: PriceRangeSliderProps) => {
    const makeSnapPoints = (min: number, max: number): number[] => {
        if (!Number.isFinite(max)) {
            return DEFAULT_SNAP_POINTS
        }
    
        const STEP = 100
        const START = Math.max(1000, Math.floor(min / STEP) * STEP)
    
        const snaps = Array.from(
            { length: Math.floor((max - START) / STEP) + 1 },
            (_, i) => START + i * STEP
        )
    
        const result = Array.from(new Set([min, max, ...snaps])).sort((a, b) => a - b)
        console.log(result)
        return result.sort((a, b) => a - b)
    }

    const [origMin, origMinVal] = useState(min);
    const [origMax, origMaxVal] = useState(max);
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const minValRef = useRef(min);
    const maxValRef = useRef(max);
    const range = useRef<HTMLDivElement | null>(null);
    const sliderWidth = mobileScreen ? "150px" : width || "300px";

    DEFAULT_SNAP_POINTS = makeSnapPoints(origMin, origMax)

    // Unique ID so the scoped <style> doesn't bleed to other sliders on the page
    const uid = useRef(`prs-${Math.random().toString(36).slice(2, 7)}`).current;

    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);
        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);
        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    useEffect(() => {
        if (minVal !== minValRef.current || maxVal !== maxValRef.current) {
            onChange({ min: minVal, max: maxVal });
            minValRef.current = minVal;
            maxValRef.current = maxVal;
        }
    }, [minVal, maxVal, onChange]);

    const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = Math.min(Number(event.target.value), maxVal - 1);
        const snapped = snapPoints.length ? snapToNearest(raw, snapPoints, snapThreshold) : raw;
        const value = Math.min(snapped, maxVal - 1);
        setMinVal(value);
    };

    const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = Math.max(Number(event.target.value), minVal + 1);
        const snapped = snapPoints.length ? snapToNearest(raw, snapPoints, snapThreshold) : raw;
        const value = Math.max(snapped, minVal + 1);
        setMaxVal(value);
    };

    return (
        <div className='w-full flex items-center justify-center flex-col space-y-3'>

            {/* Scoped thumb-size override */}
            <style>{`
                #${uid} .thumb::-webkit-slider-thumb {
                    width: ${thumbSize}px;
                    height: ${thumbSize}px;
                }
                #${uid} .thumb::-moz-range-thumb {
                    width: ${thumbSize}px;
                    height: ${thumbSize}px;
                }
            `}</style>

            {/* Display Price Value */}
            {!mobileScreen ? (
                <div className="w-[300px] px-4 flex items-center justify-between gap-x-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                        ₱ {minVal.toLocaleString()}
                    </span>
                    <div className="flex-1 border-dashed border border-neutral-500 mt-1" />
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                        ₱ {maxVal.toLocaleString()}
                    </span>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ background: "#f5f0f2", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "#6B0F2B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        ₱{minVal.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 4px" }}>
                        to
                    </span>
                    <span style={{ background: "#f5f0f2", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "#6B0F2B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        ₱{maxVal.toLocaleString()}
                    </span>
                </div>
            )}

            {/* Slider */}
            <div id={uid} className="multi-slide-input-container" style={{ width: sliderWidth }}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={handleMinChange}
                    className="thumb thumb-left"
                    style={{
                        width: sliderWidth,
                        zIndex: minVal > max - 100 || minVal === maxVal ? 5 : undefined,
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="thumb thumb-right"
                    style={{
                        width: sliderWidth,
                        zIndex: minVal > max - 100 || minVal === maxVal ? 4 : undefined,
                    }}
                />
                <div className="slider">
                    <div style={{ backgroundColor: trackColor }} className="track-slider" />
                    <div ref={range} style={{ backgroundColor: rangeColor }} className="range-slider" />
                </div>
            </div>

        </div>
    );
};

export default PriceRangeSlider;