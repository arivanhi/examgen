"use client";

import { useState } from "react";

export default function ExamGeneratorForm() {
  const [metadata, setMetadata] = useState({
    programStudi: "Teknik Elektro",
    mataKuliah: "",
    hariTanggal: "",
    waktu: "",
    sifat: "",
    kelompok: "",
    dosenPengampu: "",
  });

  const [cpmkList, setCpmkList] = useState([
    { id: "CPMK 1", deskripsi: "" }
  ]);
  
  const [soalList, setSoalList] = useState([
    {
      nomorSoal: 1,
      bentukSoal: "Essay", // Default awal
      uraianMateri: "",
      bobotPersen: 0,
      pemetaanCpmk: { subCpmk: "", cpmk: "" },
      kontenSoal: { teksPertanyaan: "", gambarPendukung: [] as string[] },
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddCpmk = () => {
    setCpmkList([...cpmkList, { id: `CPMK ${cpmkList.length + 1}`, deskripsi: "" }]);
  };

  const handleAddSoal = () => {
    setSoalList([
      ...soalList, 
      {
        nomorSoal: soalList.length + 1,
        bentukSoal: "Essay",
        uraianMateri: "",
        bobotPersen: 0,
        pemetaanCpmk: { subCpmk: "", cpmk: "" },
        kontenSoal: { teksPertanyaan: "", gambarPendukung: [] },
      }
    ]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, soalIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newSoalList = [...soalList];
        newSoalList[soalIndex].kontenSoal.gambarPendukung = [base64String];
        setSoalList(newSoalList);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const payload = {
      templateId: "teknik_elektro",
      metadata: {
        ...metadata,
        dosenPengampu: [metadata.dosenPengampu], 
      },
      cpmkList,
      soalList,
      pengesahan: {
        koordinatorMk: { nama: "Nama Koordinator, S.T., M.T.", tanggal: "2026-06-10" },
        kaprogdi: { nama: "Dr. Ir. M ARY HERYANTO, S.T., M.Eng., IPU, ASEAN Eng", tanggal: "" },
      },
    };

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal mengenerate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mencetak PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 bg-gray-50 text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">
        Udinus Exam PDF Generator - Teknik Elektro
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
        
        {/* --- SECTION 1: METADATA --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Identitas Ujian</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mata Kuliah</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" required
                value={metadata.mataKuliah}
                onChange={(e) => setMetadata({ ...metadata, mataKuliah: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hari / Tanggal</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" placeholder="Contoh: Senin, 15 Juni 2026" required
                value={metadata.hariTanggal}
                onChange={(e) => setMetadata({ ...metadata, hariTanggal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kelompok</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" placeholder="E11.4401"
                value={metadata.kelompok}
                onChange={(e) => setMetadata({ ...metadata, kelompok: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waktu</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" placeholder="08:00 - 10:00"
                value={metadata.waktu}
                onChange={(e) => setMetadata({ ...metadata, waktu: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dosen Pengampu</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" placeholder="Nama Dosen, S.T., M.T."
                value={metadata.dosenPengampu}
                onChange={(e) => setMetadata({ ...metadata, dosenPengampu: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sifat Ujian</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" placeholder="Buka Buku / Tutup Buku"
                value={metadata.sifat}
                onChange={(e) => setMetadata({ ...metadata, sifat: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 2: CPMK --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Daftar CPMK</h2>
          {cpmkList.map((cpmk, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <input type="text" className="w-1/4 border border-gray-300 p-2 rounded bg-gray-100 font-semibold" value={cpmk.id} readOnly />
              <input type="text" className="w-3/4 border border-gray-300 p-2 rounded" placeholder="Deskripsi CPMK..." required
                value={cpmk.deskripsi}
                onChange={(e) => {
                  const newList = [...cpmkList];
                  newList[index].deskripsi = e.target.value;
                  setCpmkList(newList);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddCpmk} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">
            + Tambah CPMK
          </button>
        </section>

        {/* --- SECTION 3: SOAL & MAPPING --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Daftar Soal & Mapping</h2>
          {soalList.map((soal, index) => (
            <div key={index} className="border border-gray-300 p-4 rounded mb-6 bg-gray-50">
              <h3 className="font-bold mb-3 text-lg">Soal No. {soal.nomorSoal}</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bentuk Soal</label>
                  <select className="w-full border border-gray-300 p-2 rounded bg-white" required
                    value={soal.bentukSoal}
                    onChange={(e) => {
                      const newList = [...soalList];
                      newList[index].bentukSoal = e.target.value;
                      setSoalList(newList);
                    }}>
                    <option value="Essay">Essay</option>
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Uraian">Uraian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pilih Induk CPMK</label>
                  <select className="w-full border border-gray-300 p-2 rounded bg-white" required
                    value={soal.pemetaanCpmk.cpmk}
                    onChange={(e) => {
                      const newList = [...soalList];
                      newList[index].pemetaanCpmk.cpmk = e.target.value;
                      setSoalList(newList);
                    }}>
                    <option value="">-- Pilih CPMK --</option>
                    {cpmkList.map((c, i) => (
                      <option key={i} value={c.id.replace("CPMK ", "")}>{c.id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID Sub-CPMK</label>
                  <input type="text" className="w-full border border-gray-300 p-2 rounded bg-white" placeholder="Contoh: 1,2" required
                    value={soal.pemetaanCpmk.subCpmk}
                    onChange={(e) => {
                      const newList = [...soalList];
                      newList[index].pemetaanCpmk.subCpmk = e.target.value;
                      setSoalList(newList);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bobot (%)</label>
                  <input type="number" className="w-full border border-gray-300 p-2 rounded bg-white" min="0" max="100" required
                    value={soal.bobotPersen === 0 ? "" : soal.bobotPersen}
                    onChange={(e) => {
                      const newList = [...soalList];
                      newList[index].bobotPersen = Number(e.target.value);
                      setSoalList(newList);
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Uraian Materi</label>
                <input type="text" className="w-full border border-gray-300 p-2 rounded bg-white" placeholder="Contoh: Analisis Kestabilan Sistem" required
                  value={soal.uraianMateri}
                  onChange={(e) => {
                    const newList = [...soalList];
                    newList[index].uraianMateri = e.target.value;
                    setSoalList(newList);
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Teks Pertanyaan</label>
                <textarea className="w-full border border-gray-300 p-2 rounded bg-white h-24" placeholder="Tuliskan pertanyaan ujian di sini..." required
                  value={soal.kontenSoal.teksPertanyaan}
                  onChange={(e) => {
                    const newList = [...soalList];
                    newList[index].kontenSoal.teksPertanyaan = e.target.value;
                    setSoalList(newList);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gambar Pendukung (Opsional)</label>
                <input type="file" accept="image/*" className="w-full text-sm bg-white border border-gray-300 p-1 rounded"
                  onChange={(e) => handleImageUpload(e, index)}
                />
                {soal.kontenSoal.gambarPendukung.length > 0 && (
                   <span className="text-xs text-green-600 block mt-2 font-semibold">✓ Gambar berhasil dilampirkan (Siap di-generate)</span>
                )}
              </div>
            </div>
          ))}
          
          <button type="button" onClick={handleAddSoal} className="text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">
            + Tambah Soal
          </button>
        </section>

        <button type="submit" disabled={isGenerating} className="w-full bg-blue-700 text-white font-bold py-3 rounded hover:bg-blue-800 disabled:opacity-50 transition duration-200 shadow-md">
          {isGenerating ? "Mencetak PDF..." : "Generate PDF Sekarang"}
        </button>

      </form>
    </main>
  );
}