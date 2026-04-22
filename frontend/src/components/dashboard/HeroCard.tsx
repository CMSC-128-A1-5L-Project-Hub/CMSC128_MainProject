import { HERO_GRADIENT } from "../designTokens";

export default function HeroBanner() {
  return (
    <div
      className="rounded-2xl px-6 py-6 flex flex-row justify-between items-center text-white min-h-[120px]"
      style={{ background: HERO_GRADIENT }}
    >
      <div className="flex flex-col justify-center">
        <p className="text-[11px] font-semibold tracking-widest" style={{ color: "#C9973A" }}>
          GOOD DAY, DAL CADSAWAN
        </p>
        <h1 className="text-[28px] md:text-[32px] font-bold mt-1 leading-tight">
          Here's how Narra Residences is doing so far.
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
          You have 2 pending applications and 3 new notifications today.
        </p>
      </div>

      <div className="hidden md:block w-28 h-28 bg-white/10 rounded-xl shrink-0" />
    </div>
  );
}