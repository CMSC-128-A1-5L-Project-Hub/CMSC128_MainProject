import { useState } from "react";

import Sidebar from "../../components/Sidebar";

import Bell from "../../assets/icons/bell_icon.svg?react";
import Camera from "../../assets/icons/camera.svg";
import Pencil from "../../assets/icons/edit.svg";
import BadgeCheck from "../../assets/icons/verify.svg";
import FileUp from "../../assets/icons/upload.svg";
import Save from "../../assets/icons/save.svg";

interface ProfileData {
  fullName: string;
  upMail: string;
  facebook: string;
  phone: string;
  employer: string;
  altPhone: string;
  verifiedSince: string;
  currentDorm: string;
  dormMeta: string;
}

const initialData: ProfileData = {
  fullName: "Ana Marie Reyes",
  upMail: "ana.reyes@up.edu.ph",
  facebook: "facebook.com/anareyes",
  phone: "+63 912 345 6789",
  employer: "JANELLA CASSANDRA SISON",
  altPhone: "NONE",
  verifiedSince: "Mar 2026",
  currentDorm: "Kamia Residence Hall",
  dormMeta: "Shared • 2nd Semester, AY 2025–26",
};

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<ProfileData>(initialData);

  const update = (k: keyof ProfileData, v: string) =>
    setData((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-[#2A1F1A] lg:flex">
      <Sidebar role="manager" />

      <div className="flex-1">
        <header className="border-b border-[#EADFD3] px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 pl-12 lg:pl-0">
              <span className="h-6 w-1 rounded-full bg-[#3D0718]" />
              <h1 className="font-serif text-3xl italic text-[#3D0718] md:text-4xl font-bold">
                Profile
              </h1>
            </div>

            <button
              aria-label="Notifications"
            //   className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D0718]"
            >
              <Bell className="h-10 w-10 text-[#3D0718]" />
            </button>
          </div>
        </header>

        <main className="px-3 py-4 md:px-6 lg:px-8 lg:py-6">
          <section className="overflow-hidden rounded-[28px] border border-[#EADFD3] bg-white shadow-sm">
            <div className="p-4 md:p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                {/* LEFT COLUMN */}
                <div className="w-full lg:w-[280px] lg:shrink-0">
                  {/* Mobile top arrangement */}
                  <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 md:grid-cols-[170px_minmax(0,1fr)] lg:block">
                    <div className="relative h-[170px] overflow-hidden rounded-2xl bg-[#F6EDEF] md:h-[220px] lg:h-[280px]">
                      <button
                        aria-label="Change photo"
                        // className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#EADFD3] bg-white"
                      >
                        <img src={Camera} alt="" className="h-7 w-7" />
                      </button>

                      <div className="flex h-full items-end justify-center">
                        <div className="h-[110px] w-[70px] rounded-t-full bg-[#7A2948] md:h-[150px] md:w-[90px] lg:h-[210px] lg:w-[140px]" />
                      </div>
                    </div>

                    {/* Mobile-only right of photo */}
                    <div className="min-w-0 lg:hidden">
                      <p className="mb-1 text-[10px] font-semibold tracking-wider text-[#A88993] md:text-xs">
                        FULL NAME
                      </p>

                      <input
                        value={data.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        readOnly={!editing}
                        className="w-full bg-transparent text-3x1 font-bold leading-none text-[#2A1F1A] outline-none read-only:cursor-default md:text-[2rem]"
                      />

                      <div className="mt-3 flex flex-col items-start gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4EA] px-3 py-2 text-[#1F7A3A]">
                          <img
                            src={BadgeCheck}
                            alt=""
                            className="h-4 w-4 shrink-0"
                          />
                          <div className="leading-tight">
                            <p className="text-xs font-semibold">
                              Verified Dormitory Manager
                            </p>
                            <p className="text-xs opacity-80">
                              Since {data.verifiedSince}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setEditing((prev) => !prev)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#D9BBC4] px-4 py-2 text-sm font-semibold text-[#A04E66]"
                        >
                          <img
                            src={editing ? Save : Pencil}
                            alt=""
                            className="h-4 w-4"
                          />
                          {editing ? "SAVE PROFILE" : "EDIT PROFILE"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="flex min-h-[76px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E6CAD3] px-3 py-3 text-left">
                      <img src={Camera} alt="" className="h-5 w-5 shrink-0" />
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold tracking-wider text-[#A04E66]">
                          PHOTO
                        </p>
                        <p className="text-[10px] text-[#C3AAB3]">JPG/PNG • 5MB</p>
                      </div>
                    </button>

                    <button className="flex min-h-[76px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E6CAD3] px-3 py-3 text-left">
                      <img src={FileUp} alt="" className="h-5 w-5 shrink-0" />
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold tracking-wider text-[#A04E66]">
                          DOCUMENTS
                        </p>
                        <p className="text-[10px] text-[#C3AAB3]">
                          Valid ID • PDF/JPG
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 hidden rounded-full bg-[#E6F4EA] px-6 py-3 text-[#1F7A3A] lg:inline-flex">
                    <div className="flex items-center gap-3">
                      <img src={BadgeCheck} alt="" className="h-4 w-4 shrink-0" />
                     
                      <div className="flex flex-col leading-tight text-center">
                        <p className="text-base lg:text-sm font-semibold">
                            Verify Dormitory Manager
                        </p>
                        <span className="text-xs opacity-80">
                            Since {data.verifiedSince}
                        </span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="min-w-0 flex-1">
                  <div className="hidden lg:flex lg:items-start lg:justify-between lg:gap-6">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-semibold tracking-wider text-[#A88993]">
                        FULL NAME
                      </p>

                      <input
                        value={data.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        readOnly={!editing}
                        className="w-full bg-transparent text-[3rem] font-bold leading-none text-[#2A1F1A] outline-none read-only:cursor-default"
                      />
                    </div>

                    <button
                      onClick={() => setEditing((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#A04E66] px-5 py-3 text-sm font-semibold text-[#A04E66]"
                    >
                      <img
                        src={editing ? Save : Pencil}
                        alt=""
                        className="h-4 w-4"
                      />
                      {editing ? "SAVE PROFILE" : "EDIT PROFILE"}
                    </button>
                  </div>

                  <div className="mt-5 hidden grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2 lg:mt-6 lg:grid">
                    <Field
                      label="UP MAIL"
                      value={data.upMail}
                      editing={editing}
                      onChange={(v) => update("upMail", v)}
                    />
                    <Field
                      label="FACEBOOK LINK"
                      value={data.facebook}
                      editing={editing}
                      onChange={(v) => update("facebook", v)}
                    />
                    <Field
                      label="PHONE NUMBER"
                      value={data.phone}
                      editing={editing}
                      onChange={(v) => update("phone", v)}
                    />
                    <Field
                      label="2ND PHONE NUMBER"
                      value={data.altPhone}
                      editing={editing}
                      onChange={(v) => update("altPhone", v)}
                    />
                  </div>

                  <div className="mt-6 hidden border-t border-[#EADFD3] pt-6 lg:grid">
                    <p className="mb-3 text-sm font-semibold tracking-wide text-[#A88993]">
                      CURRENT DORM HANDLED
                    </p>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#EADFD3] bg-[#F8EFF2] px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8C1535] text-sm font-bold text-white">
                        K
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#2A1F1A]">
                          {data.currentDorm}
                        </p>
                        <p className="text-xs text-[#A88993]">{data.dormMeta}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only lower info + dorm */}
              <div className="mt-6 lg:hidden">
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-[#F0E3E8] pt-5 md:grid-cols-2">
                  <Field
                    label="UP MAIL"
                    value={data.upMail}
                    editing={editing}
                    onChange={(v) => update("upMail", v)}
                  />
                  <Field
                    label="FACEBOOK LINK"
                    value={data.facebook}
                    editing={editing}
                    onChange={(v) => update("facebook", v)}
                  />
                  <Field
                    label="PHONE NUMBER"
                    value={data.phone}
                    editing={editing}
                    onChange={(v) => update("phone", v)}
                  />
                  <Field
                    label="2ND PHONE NUMBER"
                    value={data.altPhone}
                    editing={editing}
                    onChange={(v) => update("altPhone", v)}
                  />
                </div>

                <div className="mt-6 border-t border-[#EADFD3] pt-6">
                  <p className="mb-3 text-sm font-semibold tracking-wide text-[#A88993]">
                    CURRENT DORM HANDLED
                  </p>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#EADFD3] bg-[#F8EFF2] px-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8C1535] text-sm font-bold text-white">
                      K
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#2A1F1A]">
                        {data.currentDorm}
                      </p>
                      <p className="text-xs text-[#A88993]">{data.dormMeta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}

function Field({ label, value, editing, onChange }: FieldProps) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#A88993]">
        {label}
      </p>

      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#E6CAD3] bg-[#FBF5F7] px-3 py-2 text-sm text-[#2A1F1A] outline-none"
        />
      ) : (
        <div className="text-[15px] text-[#4A3940]">{value}</div>
      )}
    </div>
  );
}