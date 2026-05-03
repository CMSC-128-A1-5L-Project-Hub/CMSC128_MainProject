// src/components/DormCard.tsx
import React from "react";

export interface DormCardProps {
  image?: string;
  imageName?: string;
  featured?: boolean;
  name: string;
  subtitle?: string;
  meta?: string;
  minPrice: number,
  maxPrice: number,
  price: number;
  priceUnit?: string;
  chips?: string[];
  rating?: string;
  verified?: boolean;
  isSmall?: boolean;
  invisible?: boolean;
  tags?: string[];
  onView?: () => void;
}

export default function DormCard({
  image,
  imageName = "Kamia Hall, UPLB",
  featured = false,
  name,
  subtitle,
  meta,
  minPrice,
  maxPrice,
  price,
  priceUnit = "/ month",
  chips = [],
  rating,
  verified = false,
  isSmall,
  invisible = false,
  tags,
  onView,
}: DormCardProps) {

  if (isSmall) {
    return <div
      className={`bg-white rounded-[12px] overflow-hidden flex flex-col ${invisible ? "invisible" : ""
        }`}
      style={{
        boxShadow: "0 10px 24px rgba(26,10,15,0.10), 0 2px 6px rgba(26,10,15,0.05)",
        width: 140,
        minWidth: 140,
        height: 200
      }}
    >
      {/* Image */}
      <div
        className="relative mx-[8px] mt-[8px] rounded-[6px] overflow-hidden"
        style={{ height: 50 }}
      >
        <img
          src={typeof image === "string" ? image : "../src/assets/defaults/accommodation.png"}
          alt={imageName}
          className="w-full h-full object-cover"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,transparent 40%,rgba(42,4,16,0.55) 100%)",
          }}
        />

        <span className="absolute bottom-[3px] left-[5px] text-[6px] text-white/90">
          {imageName}
        </span>
      </div>

      {/* Body */}
      <div className="px-[8px] pt-[6px] pb-[8px] flex flex-col flex-1 justify-between">
        <div className="w-full overflow-hidden">

          {/* Featured */}
          {featured && (
            <span
              className="inline-block text-[7px] md:text-[8px] font-bold px-[8px] md:px-[10px] py-[1px] md:py-[2px] rounded-full mb-[3px] md:mb-[4px] max-w-full truncate"
              style={{
                background: "#C9973A",
                color: "#2A0410",
                letterSpacing: "0.06em",
              }}
            >
              FEATURED
            </span>
          )}

          {/* Name */}
          <h3
            className="text-[12px] md:text-[14px] font-bold leading-tight truncate"
            style={{ color: "#2A0410", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            title={name}
          >
            {name}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-[9px] md:text-[10px] mt-[1px] md:mt-[2px] truncate"
              style={{ color: "#8A5060" }}
              title={subtitle}
            >
              {subtitle}
            </p>
          )}

          {/* Meta */}
          {meta && (
            <div
              className="inline-flex items-center justify-center mt-[4px] md:mt-[6px] px-[6px] md:px-[8px] py-[2px] md:py-[3px] rounded-full text-[8px] md:text-[9px] font-semibold"
              style={{
                background: "#C9973A",
                color: "#FFFFFF",
              }}
              title={meta}
            >
              {meta === "partner_housing"
                ? "partner housing"
                : meta.replace(/_/g, " ")}
            </div>
          )}

{tags && (
            <div className="flex items-center gap-2 mt-2 w-full overflow-hidden">
              {tags.slice(0, 3).map((value) => (
                <div
                  key={value}
                  className="inline-flex items-center justify-center px-[5px] md:px-[6px] py-[1px] rounded-full text-[6px] md:text-[7px] font-semibold shrink-0"
                  style={{
                    background: "#E8D0D8",
                    color: "#6B0F2B",
                  }}
                  title={value}
                >
                  {value}
                </div>
              ))}

              {tags.length > 3 && (
                <div
                  className="inline-flex items-center justify-center px-[5px] py-[1px] rounded-full text-[6px] md:text-[7px] font-semibold shrink-0"
                  style={{
                    background: "#E8D0D8",
                    color: "#6B0F2B",
                  }}
                  title={tags.join(", ")}
                >
                  ...
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-[3px] md:gap-[4px] mt-[4px] md:mt-[6px] flex-wrap">
            <span
              className="text-[14px] md:text-[18px] font-bold whitespace-nowrap"
              style={{ color: "#C9973A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              ₱{minPrice.toLocaleString()} - {maxPrice.toLocaleString()}
            </span>

            <span className="text-[9px] md:text-[10px] whitespace-nowrap" style={{ color: "#8A5060" }}>
              {priceUnit}
            </span>
          </div>

          {/* Chips */}
          {chips.length > 0 && (
            <div className="flex gap-[4px] md:gap-[5px] mt-[5px] md:mt-[7px] flex-wrap">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="text-[7px] md:text-[8px] font-semibold px-[7px] md:px-[9px] py-[2px] md:py-[3px] rounded-full truncate"
                  style={{
                    background: "#F5ECF0",
                    color: "#6B0F2B",
                    border: "0.8px solid #E8D0D8",
                  }}
                  title={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* Bottom */}
        <div>
          <button
            onClick={onView}
            className="mt-[6px] w-full py-[5px] rounded-[6px] text-[8px] font-semibold text-white"
            style={{ background: "#6B0F2B" }}
          >
            View →
          </button>

          <div className="h-px mt-[5px] mb-[4px]" style={{ background: "#F0E8EC" }} />

          <div className="flex items-center gap-2">
            {verified && (
              <span className="text-[7px]" style={{ color: "#2D7A4A" }}>
                ✓
              </span>
            )}

            {rating !== undefined && (
              <span className="text-[7px]" style={{ color: "#C9973A" }}>
                ★ {rating == "6" ? "Unrated" : rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  }
  else {
    return <div
      className={`bg-white rounded-[18px] overflow-hidden flex flex-col ${invisible ? "invisible" : ""
        }`}
      style={{
        boxShadow: "0 24px 64px rgba(26,10,15,0.14), 0 4px 16px rgba(26,10,15,0.08)",
        width: 220,
        minWidth: 220,
        height: 300
      }}
    >
      {/* Image */}
      <div
        className="relative mx-[14px] mt-[14px] rounded-[10px] overflow-hidden"
        style={{ height: 80 }}
      >
        <div className="w-full h-full relative">
          <img
            src={typeof image === "string" ? image : "../src/assets/defaults/accommodation.png"}
            alt={imageName}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,transparent 40%,rgba(42,4,16,0.55) 100%)",
            }}
          />
        </div>

        <span
          className="absolute bottom-[5px] left-[8px] text-[8px] font-medium text-white/90"
          style={{ fontFamily: "sans-serif" }}
        >
          {imageName}
        </span>
      </div>

      {/* Body */}
      <div className="px-[14px] pt-3 pb-[14px] flex flex-col flex-1 justify-between">
        <div className="w-full overflow-hidden">

          {/* Featured */}
          {featured && (
            <span
              className="inline-block text-[8px] font-bold px-[10px] py-[2px] rounded-full mb-[4px] max-w-full truncate"
              style={{
                background: "#C9973A",
                color: "#2A0410",
                letterSpacing: "0.06em",
              }}
            >
              FEATURED
            </span>
          )}

          {/* Name */}
          <h3
            className="text-[14px] font-bold leading-tight text-ellipsis overflow-hidden whitespace-nowrap"
            style={{ color: "#2A0410", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            title={name}
          >
            {name}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-[10px] mt-[2px] text-ellipsis overflow-hidden whitespace-nowrap"
              style={{ color: "#8A5060" }}
              title={subtitle}
            >
              {subtitle}
            </p>
          )}

          {/* Meta */}
          {meta && (
            <div
              className="inline-flex items-center justify-center mt-[6px] px-[8px] py-[3px] rounded-full text-[9px] font-semibold max-w-full truncate"
              style={{
                background: "#C9973A",
                color: "#FFFFFF",
              }}
              title={meta}
            >
              {meta === "partner_housing" ? "partner housing" : meta}
            </div>
          )}

          {tags && (
            <div className="flex items-center gap-2 mt-2 w-full overflow-hidden">
              {tags.slice(0, 3).map((value) => (
                <div
                  key={value}
                  className="inline-flex items-center justify-center px-[5px] md:px-[6px] py-[1px] rounded-full text-[6px] md:text-[7px] font-semibold shrink-0"
                  style={{
                    background: "#E8D0D8",
                    color: "#6B0F2B",
                  }}
                  title={value}
                >
                  {value}
                </div>
              ))}

              {tags.length > 3 && (
                <div
                  className="inline-flex items-center justify-center px-[5px] py-[1px] rounded-full text-[6px] md:text-[7px] font-semibold shrink-0"
                  style={{
                    background: "#E8D0D8",
                    color: "#6B0F2B",
                  }}
                  title={tags.join(", ")}
                >
                  ...
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-[4px] mt-[6px] flex-wrap">
            <span
              className="text-[18px] font-bold whitespace-nowrap"
              style={{ color: "#C9973A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              ₱{minPrice.toLocaleString()} - {maxPrice.toLocaleString()}
            </span>

            <span className="text-[10px] whitespace-nowrap" style={{ color: "#8A5060" }}>
              {priceUnit}
            </span>
          </div>

          {/* Chips */}
          {chips.length > 0 && (
            <div className="flex gap-[5px] mt-[7px] flex-wrap max-w-full">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="text-[8px] font-semibold px-[9px] py-[3px] rounded-full max-w-full truncate"
                  style={{
                    background: "#F5ECF0",
                    color: "#6B0F2B",
                    border: "0.8px solid #E8D0D8",
                  }}
                  title={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div>
          {/* View button */}
          <button
            onClick={onView}
            className="mt-[10px] w-full py-[9px] rounded-[9px] text-[11px] font-semibold text-white tracking-wider transition-all duration-150 hover:opacity-90 hover:scale-[1.02] active:scale-95"
            style={{ background: "#6B0F2B", letterSpacing: "0.04em" }}
          >
            View Room →
          </button>

          {/* Divider */}
          <div className="h-px mt-[9px] mb-[7px]" style={{ background: "#F0E8EC" }} />

          {/* Bottom meta */}
          <div className="flex items-center gap-3">
            {verified && (
              <span
                className="text-[9px] flex items-center gap-1"
                style={{ color: "#2D7A4A" }}
              >
                <span
                  className="inline-block w-[8px] h-[8px] rounded-full"
                  style={{ background: "#EAF4EE" }}
                />
                ✓ Verified
              </span>
            )}

            {rating !== undefined && (
              <span
                className="text-[9px] flex items-center gap-1"
                style={{ color: "#C9973A" }}
              >
                <span
                  className="inline-block w-[8px] h-[8px] rounded-full"
                  style={{ background: "#FEF0E0" }}
                />
                ★ {rating == "6" ? "Unrated" : rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  }
};
