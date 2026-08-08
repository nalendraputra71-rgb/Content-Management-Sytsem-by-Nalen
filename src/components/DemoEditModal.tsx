import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Users, SlidersHorizontal, Check } from "lucide-react";

function getBlankDemographics(platform: string) {
  const platLower = (platform || "").toLowerCase();
  
  let ageBrackets = [
    { range: "13-17", value: 5 },
    { range: "18-24", value: 40 },
    { range: "25-34", value: 35 },
    { range: "35-44", value: 15 },
    { range: "45+", value: 5 },
  ];

  if (platLower.includes("tiktok")) {
    ageBrackets = [
      { range: "18-24", value: 45 },
      { range: "25-34", value: 35 },
      { range: "35-44", value: 12 },
      { range: "45-54", value: 6 },
      { range: "55+", value: 2 },
    ];
  } else if (platLower.includes("instagram") || platLower.includes("facebook") || platLower.includes("meta") || platLower.includes("threads")) {
    ageBrackets = [
      { range: "18-24", value: 30 },
      { range: "25-34", value: 38 },
      { range: "35-44", value: 18 },
      { range: "45-54", value: 8 },
      { range: "55-64", value: 4 },
      { range: "65+", value: 2 },
    ];
  } else if (platLower.includes("youtube")) {
    ageBrackets = [
      { range: "13-17", value: 5 },
      { range: "18-24", value: 25 },
      { range: "25-34", value: 35 },
      { range: "35-44", value: 20 },
      { range: "45-54", value: 10 },
      { range: "55-64", value: 4 },
      { range: "65+", value: 1 },
    ];
  }

  return {
    platform,
    gender: { male: 50, female: 50 },
    age: ageBrackets,
    cities: [
      { name: "Jakarta", percentage: 35 },
      { name: "Surabaya", percentage: 25 },
      { name: "Bandung", percentage: 15 },
      { name: "Medan", percentage: 10 },
      { name: "Semarang", percentage: 5 }
    ],
    countries: [
      { name: "Indonesia", percentage: 85 },
      { name: "Malaysia", percentage: 8 },
      { name: "Singapore", percentage: 4 },
      { name: "Japan", percentage: 2 },
      { name: "United States", percentage: 1 }
    ],
    interests: [
      { name: "Technology & Gadget", percentage: 30 },
      { name: "Lifestyle & Fashion", percentage: 25 },
      { name: "Entertainment & Film", percentage: 20 },
      { name: "Food & Culinary", percentage: 15 },
      { name: "Business & Career", percentage: 10 }
    ],
    devices: [
      { name: "Mobile", percentage: 85 },
      { name: "Desktop", percentage: 12 },
      { name: "Tablet", percentage: 3 }
    ]
  };
}

export function DemoEditModal({
  lang,
  isDemoModalOpen, setIsDemoModalOpen,
  demographics, setDemographics,
  platformFilter, platforms,
  onSaveDemographics
}: any) {
  const [editingPlatform, setEditingPlatform] = useState("");
  const [editDemoData, setEditDemoData] = useState<any>(null);
  const [tempDemographics, setTempDemographics] = useState<any>({});

  useEffect(() => {
    if (isDemoModalOpen) {
      const initialTemp = JSON.parse(JSON.stringify(demographics || {}));
      setTempDemographics(initialTemp);
      const firstPlatform = platforms?.[0];
      const startPlatform = platformFilter === "all" 
        ? (typeof firstPlatform === 'string' ? firstPlatform : (firstPlatform?.name || "TikTok")) 
        : platformFilter;
      setEditingPlatform(startPlatform);
      
      const current = initialTemp[startPlatform.toLowerCase()] || null;
      setEditDemoData(current ? JSON.parse(JSON.stringify(current)) : getBlankDemographics(startPlatform));
    }
  }, [isDemoModalOpen]);

  return (

      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-black/[0.03] flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-950 m-0 tracking-tight flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-blue-600" />
                    <span>{lang === "id" ? "Edit Demografi Audiens" : "Edit Audience Demographics"}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{lang === "id" ? "Sesuaikan persebaran demografi per platform. Perubahan disimpan secara offline di browser Anda." : "Adjust demographics distribution per platform. Changes are saved offline in your browser."}</p>
                </div>
                <button 
                  onClick={() => setIsDemoModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/[0.05] text-gray-400 hover:text-gray-900 transition-colors border-none cursor-pointer bg-transparent"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Platform Selector Row inside Modal */}
              <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">{lang === "id" ? "Pilih Platform untuk Diedit:" : "Select Platform to Edit:"}</span>
                  <div className="relative">
                    <select 
                      value={editingPlatform}
                      onChange={(e) => {
                        const nextPlatform = e.target.value;
                        const updatedTemp = {
                          ...tempDemographics,
                          [editingPlatform.toLowerCase()]: editDemoData
                        };
                        setTempDemographics(updatedTemp);
                        setEditingPlatform(nextPlatform);
                        const loadedData = updatedTemp[nextPlatform.toLowerCase()] !== undefined
                          ? updatedTemp[nextPlatform.toLowerCase()]
                          : (demographics[nextPlatform.toLowerCase()] || null);
                        setEditDemoData(loadedData ? JSON.parse(JSON.stringify(loadedData)) : getBlankDemographics(nextPlatform));
                      }}
                      className="bg-white border border-black/10 hover:border-blue-500 rounded-xl px-3.5 py-1.5 text-xs font-bold text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                    >
                      {platforms.map((p: any) => {
                        const name = typeof p === 'string' ? p : p.name;
                        return (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-xl border border-blue-200/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>{lang === "id" ? "Mengedit data:" : "Editing data:"} <strong className="text-blue-900 font-extrabold">{editingPlatform}</strong></span>
                  </div>
                </div>
              </div>

              {/* Modal Body - Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/[0.1] [&::-webkit-scrollbar-thumb]:rounded-full">
                
                {editDemoData && (
                  <>
                    {/* 1. GENDER (JENIS KELAMIN) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>{lang === "id" ? "1. Jenis Kelamin (Gender Split)" : "1. Gender Split"}</span>
                  </h4>
                  <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-pink-600">👩 {lang === "id" ? "Wanita" : "Female"}: {editDemoData.gender.female}%</span>
                      <span className="text-blue-600">👨 {lang === "id" ? "Pria" : "Male"}: {editDemoData.gender.male}%</span>
                    </div>
                    {/* Horizontal Bar Visualizer */}
                    <div className="flex h-4 rounded-full overflow-hidden bg-black/[0.04]">
                      <div className="bg-pink-500 h-full transition-all" style={{ width: `${editDemoData.gender.female}%` }} />
                      <div className="bg-blue-500 h-full transition-all" style={{ width: `${editDemoData.gender.male}%` }} />
                    </div>
                    {/* Real-time Slider */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 block">Geser untuk mengatur persentase {lang === "id" ? "Wanita" : "Female"} ({lang === "id" ? "Pria" : "Male"} otomatis menyesuaikan):</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={editDemoData.gender.female}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setEditDemoData((prev: any) => ({
                            ...prev,
                            gender: {
                              female: parseFloat(val.toFixed(2)),
                              male: parseFloat((100 - val).toFixed(2))
                            }
                          }));
                        }}
                        className="w-full h-1.5 bg-black/[0.05] rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. AGE GROUPS (KELOMPOK UMUR) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{lang === "id" ? "2. Kelompok Umur" : "2. Age Groups"}</span>
                    </h4>
                    {/* Sum Tracker */}
                    {(() => {
                      const totalAge = parseFloat(editDemoData.age.reduce((acc: number, item: any) => acc + (parseFloat(item.value) || 0), 0).toFixed(2));
                      const isValid = Math.abs(totalAge - 100) < 0.15;
                      return (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isValid ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}`}>
                          Total: {totalAge}% {(!isValid && lang === "id") ? "(Harus ~100%)" : !isValid ? "(Must be ~100%)" : ""}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02]">
                    {editDemoData.age.map((item: any, idx: number) => (
                      <div key={item.range} className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 block">{item.range}</label>
                        <div className="relative flex items-center">
                          <input 
                            type="number" 
                            min="0"
                            max="100"
                            step="any"
                            value={item.value}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              const val = rawVal === "" ? "" : Math.min(100, Math.max(0, parseFloat(rawVal) || 0));
                              const newAge = [...editDemoData.age];
                              newAge[idx] = { ...newAge[idx], value: val };
                              setEditDemoData((prev: any) => ({ ...prev, age: newAge }));
                            }}
                            className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-7 py-2.5 text-sm font-bold text-gray-900 outline-none transition-all"
                          />
                          <span className="absolute right-3 text-xs text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. LOCATIONS & INTERESTS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* CITIES */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{lang === "id" ? "3. Kota Teratas" : "3. Top Cities"}</span>
                      </h4>
                      {(() => {
                        const total = parseFloat(editDemoData.cities.reduce((acc: number, item: any) => acc + (parseFloat(item.percentage) || 0), 0).toFixed(2));
                        return <span className="text-[10px] font-bold text-gray-400">Total: {total}%</span>;
                      })()}
                    </div>
                    <div className="bg-black/[0.01] p-4 rounded-2xl border border-black/[0.02] space-y-3">
                      {editDemoData.cities.map((city: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={city.name}
                            placeholder={`Kota ${idx+1}`}
                            onChange={(e) => {
                              const newCities = [...editDemoData.cities];
                              newCities[idx] = { ...newCities[idx], name: e.target.value };
                              setEditDemoData((prev: any) => ({ ...prev, cities: newCities }));
                            }}
                            className="flex-1 min-w-0 bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                          />
                          <div className="relative w-20 shrink-0">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              step="any"
                              value={city.percentage}
                              onChange={(e) => {
                                const rawVal = e.target.value;
                                const val = rawVal === "" ? "" : Math.min(100, Math.max(0, parseFloat(rawVal) || 0));
                                const newCities = [...editDemoData.cities];
                                newCities[idx] = { ...newCities[idx], percentage: val };
                                setEditDemoData((prev: any) => ({ ...prev, cities: newCities }));
                              }}
                              className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COUNTRIES */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{lang === "id" ? "4. Negara Teratas" : "4. Top Countries"}</span>
                      </h4>
                      {(() => {
                        const total = parseFloat(editDemoData.countries.reduce((acc: number, item: any) => acc + (parseFloat(item.percentage) || 0), 0).toFixed(2));
                        return <span className="text-[10px] font-bold text-gray-400">Total: {total}%</span>;
                      })()}
                    </div>
                    <div className="bg-black/[0.01] p-4 rounded-2xl border border-black/[0.02] space-y-3">
                      {editDemoData.countries.map((country: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={country.name}
                            placeholder={`Negara ${idx+1}`}
                            onChange={(e) => {
                              const newCountries = [...editDemoData.countries];
                              newCountries[idx] = { ...newCountries[idx], name: e.target.value };
                              setEditDemoData((prev: any) => ({ ...prev, countries: newCountries }));
                            }}
                            className="flex-1 min-w-0 bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                          />
                          <div className="relative w-20 shrink-0">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              step="any"
                              value={country.percentage}
                              onChange={(e) => {
                                const rawVal = e.target.value;
                                const val = rawVal === "" ? "" : Math.min(100, Math.max(0, parseFloat(rawVal) || 0));
                                const newCountries = [...editDemoData.countries];
                                newCountries[idx] = { ...newCountries[idx], percentage: val };
                                setEditDemoData((prev: any) => ({ ...prev, countries: newCountries }));
                              }}
                              className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INTERESTS */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{lang === "id" ? "5. Minat Audiens" : "5. Audience Interests"}</span>
                      </h4>
                      {(() => {
                        const total = parseFloat(editDemoData.interests.reduce((acc: number, item: any) => acc + (parseFloat(item.percentage) || 0), 0).toFixed(2));
                        return <span className="text-[10px] font-bold text-gray-400">Total: {total}%</span>;
                      })()}
                    </div>
                    <div className="bg-black/[0.01] p-4 rounded-2xl border border-black/[0.02] space-y-3">
                      {editDemoData.interests.map((interest: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={interest.name}
                            placeholder={lang === "id" ? `Kategori Minat ${idx+1}` : `Interest Category ${idx+1}`}
                            onChange={(e) => {
                              const newInts = [...editDemoData.interests];
                              newInts[idx] = { ...newInts[idx], name: e.target.value };
                              setEditDemoData((prev: any) => ({ ...prev, interests: newInts }));
                            }}
                            className="flex-1 min-w-0 bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                          />
                          <div className="relative w-20 shrink-0">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              step="any"
                              value={interest.percentage}
                              onChange={(e) => {
                                const rawVal = e.target.value;
                                const val = rawVal === "" ? "" : Math.min(100, Math.max(0, parseFloat(rawVal) || 0));
                                const newInts = [...editDemoData.interests];
                                newInts[idx] = { ...newInts[idx], percentage: val };
                                setEditDemoData((prev: any) => ({ ...prev, interests: newInts }));
                              }}
                              className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 4. DEVICES */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{lang === "id" ? "6. Perangkat / Devices" : "6. Devices"}</span>
                    </h4>
                    {(() => {
                      const totalDevices = parseFloat(editDemoData.devices.reduce((acc: number, item: any) => acc + (parseFloat(item.percentage) || 0), 0).toFixed(2));
                      const isValid = Math.abs(totalDevices - 100) < 0.15;
                      return (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isValid ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}`}>
                          Total: {totalDevices}% {(!isValid && lang === "id") ? "(Harus ~100%)" : !isValid ? "(Must be ~100%)" : ""}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02]">
                    {editDemoData.devices.map((device: any, idx: number) => (
                      <div key={device.name} className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 block">{device.name}</label>
                        <div className="relative flex items-center">
                          <input 
                            type="number" 
                            min="0"
                            max="100"
                            step="any"
                            value={device.percentage}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              const val = rawVal === "" ? "" : Math.min(100, Math.max(0, parseFloat(rawVal) || 0));
                              const newDevs = [...editDemoData.devices];
                              newDevs[idx] = { ...newDevs[idx], percentage: val };
                              setEditDemoData((prev: any) => ({ ...prev, devices: newDevs }));
                            }}
                            className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-7 py-2.5 text-sm font-bold text-gray-900 outline-none transition-all"
                          />
                          <span className="absolute right-3 text-xs text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  </>
                )}

              </div>

              {/* Modal Footer (Sticky Bottom Action Bar) */}
              <div className="p-5 bg-gray-50 border-t border-black/[0.03] flex justify-end items-center shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsDemoModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-black/[0.03] rounded-xl cursor-pointer transition-all border-none bg-transparent"
                  >
                    {lang === "id" ? "Batal" : "Cancel"}
                  </button>
                  <button 
                    onClick={() => {
                      const finalTemp = {
                        ...tempDemographics,
                        [editingPlatform.toLowerCase()]: editDemoData
                      };
                      setDemographics(finalTemp);
                      try {
                        localStorage.setItem("hubify_custom_demographics", JSON.stringify(finalTemp));
                      } catch (e) {}
                      if (onSaveDemographics) {
                        onSaveDemographics(finalTemp);
                      }
                      setIsDemoModalOpen(false);
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg border-none"
                  >
                    {lang === "id" ? "Simpan Perubahan" : "Save Changes"}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

  );
}
