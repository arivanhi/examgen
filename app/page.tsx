"use client";

import { useState } from "react";

// ─── Helper: decode base64 PDF → trigger download ─────────────────────────
function downloadBase64Pdf(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ExamGeneratorForm() {
  const [metadata, setMetadata] = useState({
    programStudi:  "Teknik Elektro",
    mataKuliah:    "",
    hariTanggal:   "",
    waktu:         "",
    sifat:         "",
    kelompok:      "",
    dosenPengampu: "",
  });

  const [cpmkList, setCpmkList] = useState([
    { id: "CPMK 1", deskripsi: "" },
  ]);

  const [soalList, setSoalList] = useState([
    {
      nomorSoal:    1,
      bentukSoal:   "Essay",
      uraianMateri: "",
      bobotPersen:  0,
      pemetaanCpmk: { subCpmk: "", cpmk: "" },
      kontenSoal:   { teksPertanyaan: "", gambarPendukung: [] as string[] },
    },
  ]);

  const [pengesahan, setPengesahan] = useState({
    koordinatorMk: { nama: "", tanggal: "" },
    kaprogdi:      { nama: "Dr. Ir. M ARY HERYANTO, S.T., M.Eng., IPU, ASEAN Eng", tanggal: "" },
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // ─── CPMK handlers ──────────────────────────────────────────────────────
  const handleAddCpmk = () => {
    setCpmkList([...cpmkList, { id: `CPMK ${cpmkList.length + 1}`, deskripsi: "" }]);
  };

  // ─── Soal handlers ──────────────────────────────────────────────────────
  const handleAddSoal = () => {
    setSoalList([
      ...soalList,
      {
        nomorSoal:    soalList.length + 1,
        bentukSoal:   "Essay",
        uraianMateri: "",
        bobotPersen:  0,
        pemetaanCpmk: { subCpmk: "", cpmk: "" },
        kontenSoal:   { teksPertanyaan: "", gambarPendukung: [] },
      },
    ]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, soalIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updated = [...soalList];
      updated[soalIndex].kontenSoal.gambarPendukung = [base64];
      setSoalList(updated);
    };
    reader.readAsDataURL(file);
  };

  // ─── Submit: generate 2 PDF ──────────────────────────────────────────────
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
      pengesahan,
    };

    try {
      const response = await fetch("/api/generate-pdf", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Gagal generate PDF");
      }

      const { assessmentPdf, questionsPdf } = await response.json();

      // Download PDF 1 — Assessment
      downloadBase64Pdf(
        assessmentPdf,
        `${metadata.mataKuliah || "Ujian"}_Assessment.pdf`
      );

      // Download PDF 2 — Soal (delay agar browser tidak blok popup)
      setTimeout(() => {
        downloadBase64Pdf(
          questionsPdf,
          `${metadata.mataKuliah || "Ujian"}_Soal.pdf`
        );
      }, 600);

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan: " + String(error));
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <main className="max-w-4xl mx-auto p-6 bg-gray-50 text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">
        Udinus Exam PDF Generator - Teknik Elektro
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">

        {/* ── SECTION 1: METADATA ─────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
            Identitas Ujian
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mata Kuliah</label>
              <input type="text" required className="w-full border border-gray-300 p-2 rounded"
                value={metadata.mataKuliah}
                onChange={(e) => setMetadata({ ...metadata, mataKuliah: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hari / Tanggal</label>
              <input type="text" required placeholder="Senin, 15 Juni 2026"
                className="w-full border border-gray-300 p-2 rounded"
                value={metadata.hariTanggal}
                onChange={(e) => setMetadata({ ...metadata, hariTanggal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kelompok</label>
              <input type="text" placeholder="E11.4401"
                className="w-full border border-gray-300 p-2 rounded"
                value={metadata.kelompok}
                onChange={(e) => setMetadata({ ...metadata, kelompok: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waktu</label>
              <input type="text" placeholder="08:00 - 10:00"
                className="w-full border border-gray-300 p-2 rounded"
                value={metadata.waktu}
                onChange={(e) => setMetadata({ ...metadata, waktu: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dosen Pengampu</label>
              <input type="text" placeholder="Nama Dosen, S.T., M.T."
                className="w-full border border-gray-300 p-2 rounded"
                value={metadata.dosenPengampu}
                onChange={(e) => setMetadata({ ...metadata, dosenPengampu: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sifat Ujian</label>
              <input type="text" placeholder="Buka Buku / Tutup Buku"
                className="w-full border border-gray-300 p-2 rounded"
                value={metadata.sifat}
                onChange={(e) => setMetadata({ ...metadata, sifat: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* ── SECTION 2: CPMK ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
            Daftar CPMK
          </h2>
          {cpmkList.map((cpmk, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <input type="text" readOnly
                className="w-1/4 border border-gray-300 p-2 rounded bg-gray-100 font-semibold"
                value={cpmk.id}
              />
              <input type="text" required placeholder="Deskripsi CPMK..."
                className="w-3/4 border border-gray-300 p-2 rounded"
                value={cpmk.deskripsi}
                onChange={(e) => {
                  const updated = [...cpmkList];
                  updated[index].deskripsi = e.target.value;
                  setCpmkList(updated);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddCpmk}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">
            + Tambah CPMK
          </button>
        </section>

        {/* ── SECTION 3: SOAL & MAPPING ───────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
            Daftar Soal &amp; Mapping
          </h2>
          {soalList.map((soal, index) => (
            <div key={index} className="border border-gray-300 p-4 rounded mb-6 bg-gray-50">
              <h3 className="font-bold mb-3 text-lg">Soal No. {soal.nomorSoal}</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bentuk Soal</label>
                  <select required className="w-full border border-gray-300 p-2 rounded bg-white"
                    value={soal.bentukSoal}
                    onChange={(e) => {
                      const updated = [...soalList];
                      updated[index].bentukSoal = e.target.value;
                      setSoalList(updated);
                    }}>
                    <option value="Essay">Essay</option>
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Uraian">Uraian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pilih Induk CPMK</label>
                  <select required className="w-full border border-gray-300 p-2 rounded bg-white"
                    value={soal.pemetaanCpmk.cpmk}
                    onChange={(e) => {
                      const updated = [...soalList];
                      updated[index].pemetaanCpmk.cpmk = e.target.value;
                      setSoalList(updated);
                    }}>
                    <option value="">-- Pilih CPMK --</option>
                    {cpmkList.map((c, i) => (
                      <option key={i} value={c.id.replace("CPMK ", "")}>{c.id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID Sub-CPMK</label>
                  <input type="text" required placeholder="Contoh: 1,2"
                    className="w-full border border-gray-300 p-2 rounded bg-white"
                    value={soal.pemetaanCpmk.subCpmk}
                    onChange={(e) => {
                      const updated = [...soalList];
                      updated[index].pemetaanCpmk.subCpmk = e.target.value;
                      setSoalList(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bobot (%)</label>
                  <input type="number" required min="0" max="100"
                    className="w-full border border-gray-300 p-2 rounded bg-white"
                    value={soal.bobotPersen === 0 ? "" : soal.bobotPersen}
                    onChange={(e) => {
                      const updated = [...soalList];
                      updated[index].bobotPersen = Number(e.target.value);
                      setSoalList(updated);
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Uraian Materi</label>
                <input type="text" required placeholder="Contoh: Analisis Kestabilan Sistem"
                  className="w-full border border-gray-300 p-2 rounded bg-white"
                  value={soal.uraianMateri}
                  onChange={(e) => {
                    const updated = [...soalList];
                    updated[index].uraianMateri = e.target.value;
                    setSoalList(updated);
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Teks Pertanyaan</label>
                <textarea required placeholder="Tuliskan pertanyaan ujian di sini..."
                  className="w-full border border-gray-300 p-2 rounded bg-white h-24"
                  value={soal.kontenSoal.teksPertanyaan}
                  onChange={(e) => {
                    const updated = [...soalList];
                    updated[index].kontenSoal.teksPertanyaan = e.target.value;
                    setSoalList(updated);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Gambar Pendukung (Opsional)
                </label>
                <input type="file" accept="image/*"
                  className="w-full text-sm bg-white border border-gray-300 p-1 rounded"
                  onChange={(e) => handleImageUpload(e, index)}
                />
                {soal.kontenSoal.gambarPendukung.length > 0 && (
                  <span className="text-xs text-green-600 block mt-2 font-semibold">
                    ✓ Gambar berhasil dilampirkan
                  </span>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddSoal}
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">
            + Tambah Soal
          </button>
        </section>

        {/* ── SECTION 4: PENGESAHAN ────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
            Pengesahan
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Koordinator MK</label>
              <input type="text" placeholder="Nama, S.T., M.T."
                className="w-full border border-gray-300 p-2 rounded"
                value={pengesahan.koordinatorMk.nama}
                onChange={(e) => setPengesahan({
                  ...pengesahan,
                  koordinatorMk: { ...pengesahan.koordinatorMk, nama: e.target.value },
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Koordinator MK</label>
              <input type="text" placeholder="30/12/2025"
                className="w-full border border-gray-300 p-2 rounded"
                value={pengesahan.koordinatorMk.tanggal}
                onChange={(e) => setPengesahan({
                  ...pengesahan,
                  koordinatorMk: { ...pengesahan.koordinatorMk, tanggal: e.target.value },
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Kaprogdi</label>
              <input type="text"
                className="w-full border border-gray-300 p-2 rounded"
                value={pengesahan.kaprogdi.nama}
                onChange={(e) => setPengesahan({
                  ...pengesahan,
                  kaprogdi: { ...pengesahan.kaprogdi, nama: e.target.value },
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Kaprogdi</label>
              <input type="text" placeholder="01/01/2026"
                className="w-full border border-gray-300 p-2 rounded"
                value={pengesahan.kaprogdi.tanggal}
                onChange={(e) => setPengesahan({
                  ...pengesahan,
                  kaprogdi: { ...pengesahan.kaprogdi, tanggal: e.target.value },
                })}
              />
            </div>
          </div>
        </section>

        {/* ── SUBMIT ──────────────────────────────────────────────────── */}
        <button type="submit" disabled={isGenerating}
          className="w-full bg-blue-700 text-white font-bold py-3 rounded hover:bg-blue-800 disabled:opacity-50 transition duration-200 shadow-md">
          {isGenerating
            ? "Membuat PDF... (mohon tunggu)"
            : "Generate 2 PDF Sekarang (Assessment + Soal)"}
        </button>

      </form>
    </main>
  );
}