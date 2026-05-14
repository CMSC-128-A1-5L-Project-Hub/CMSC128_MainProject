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
    mobileScreen?: boolean
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
    mobileScreen = false
}: PriceRangeSliderProps) => {

    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const minValRef = useRef(min);
    const maxValRef = useRef(max);
    const range = useRef<HTMLDivElement | null>(null);
    const sliderWidth = mobileScreen ? "150px" : width || "300px"

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
        if (minVal != minValRef.current || maxVal != maxValRef.current) {
            onChange({ min: minVal, max: maxVal });
            minValRef.current = minVal;
            maxValRef.current = maxVal;
        }
    }, [minVal, maxVal, onChange]);

    return (
        <div className='w-full flex items-center justify-center flex-col space-y-14'>

            {/* Display Price Value */}
            {!mobileScreen ? <div className="w-[300px] px-4 flex items-center justify-between gap-x-5">

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                    ₱ {minVal}
                </span>

                <div className="flex-1 border-dashed border border-neutral-500 mt-1"></div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                    ₱ {maxVal}
                </span>

            </div> :

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10,}}>
                <span style={{ background: "#f5f0f2", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "#6B0F2B", fontFamily: "'Plus Jakarta Sans', sans-serif",}}>
                    ₱{minVal}
                </span>

                <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 4px",}}>
                    to
                </span>

                <span style={{ background: "#f5f0f2", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "#6B0F2B", fontFamily: "'Plus Jakarta Sans', sans-serif",}}>
                    ₱{maxVal}
                </span>
            </div>
            }

            {/* Style the price range slider */}
            <div className="multi-slide-input-container" style={{ width: sliderWidth }}>

                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={(event) => {
                        const value = Math.min(Number(event.target.value), maxVal - 1);
                        setMinVal(value);
                    }}
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
                    onChange={(event) => {
                        const value = Math.max(Number(event.target.value), minVal + 1);
                        setMaxVal(value);
                    }}
                    className="thumb thumb-right"
                    style={{
                        width: sliderWidth,
                        zIndex: minVal > max - 100 || minVal === maxVal ? 4 : undefined,
                    }}
                />

                <div className="slider">
                    <div
                        style={{ backgroundColor: trackColor }}
                        className="track-slider"
                    />

                    <div
                        ref={range}
                        style={{ backgroundColor: rangeColor }}
                        className="range-slider"
                    />

                </div>

            </div>

        </div>
    )
}

export default PriceRangeSlider
