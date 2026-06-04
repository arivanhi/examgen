"use client";

import { useState } from "react";

export default function ExamGeneratorForm() {
	// 1. Inisialisasi State berdasarkan Skema JSON
	const [metadata, setMetadata] = useState({
		programStudi: "Teknik Elektro",
		mataKuliah: "",
		hariTanggal: "",
		waktu: "",
		sifat: "",
		kelompok: "",
		dosenPengampu: "",
	});

	const [cpmkList, setCpmkList] = useState([{ id: "CPMK 1", deskripsi: "" }]);

	const [soalList, setSoalList] = useState([
		{
			nomorSoal: 1,
			bentukSoal: "Uraian",
			uraianMateri: "",
			bobotPersen: 0,
			pemetaanCpmk: { subCpmk: "", cpmk: "" },
			kontenSoal: { teksPertanyaan: "", gambarPendukung: [] as string[] },
		},
	]);

	const [isGenerating, setIsGenerating] = useState(false);

	// 2. Fungsi Helper: Konversi Gambar ke Base64
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, soalIndex: number) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				const newSoalList = [...soalList];
				// Menyimpan base64 ke array gambarPendukung
				newSoalList[soalIndex].kontenSoal.gambarPendukung = [base64String];
				setSoalList(newSoalList);
			};
			reader.readAsDataURL(file);
		}
	};

	// 3. Fungsi Submit ke API Route
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsGenerating(true);

		// Menyusun final payload sesuai kesepakatan skema
		const payload = {
			templateId: "teknik_elektro",
			metadata: {
				...metadata,
				dosenPengampu: [metadata.dosenPengampu], // Diubah ke array sesuai skema
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

			// Menerima file PDF sebagai Blob dan membukanya di tab baru
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
			<h1 className="text-2xl font-bold mb-6 text-center text-blue-900">Udinus Exam PDF Generator - Teknik Elektro</h1>

			<form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
				{/* --- SECTION 1: METADATA IDENTITAS --- */}
				<section>
					<h2 className="text-xl font-semibold mb-4 border-b pb-2">Identitas Ujian</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Mata Kuliah</label>
							<input
								type="text"
								className="w-full border p-2 rounded"
								required
								value={metadata.mataKuliah}
								onChange={(e) => setMetadata({ ...metadata, mataKuliah: e.target.value })}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Hari / Tanggal</label>
							<input
								type="text"
								className="w-full border p-2 rounded"
								placeholder="Contoh: Senin, 15 Juni 2026"
								required
								value={metadata.hariTanggal}
								onChange={(e) => setMetadata({ ...metadata, hariTanggal: e.target.value })}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Kelompok</label>
							<input
								type="text"
								className="w-full border p-2 rounded"
								placeholder="E11.4401"
								value={metadata.kelompok}
								onChange={(e) => setMetadata({ ...metadata, kelompok: e.target.value })}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Waktu</label>
							<input
								type="text"
								className="w-full border p-2 rounded"
								placeholder="08:00 - 10:00"
								value={metadata.waktu}
								onChange={(e) => setMetadata({ ...metadata, waktu: e.target.value })}
							/>
						</div>
					</div>
				</section>

				{/* --- SECTION 2: CPMK --- */}
				<section>
					<h2 className="text-xl font-semibold mb-4 border-b pb-2">Daftar CPMK</h2>
					{cpmkList.map((cpmk, index) => (
						<div key={index} className="flex gap-4 mb-2">
							<input type="text" className="w-1/4 border p-2 rounded bg-gray-100" value={cpmk.id} readOnly />
							<input
								type="text"
								className="w-3/4 border p-2 rounded"
								placeholder="Deskripsi CPMK..."
								required
								value={cpmk.deskripsi}
								onChange={(e) => {
									const newList = [...cpmkList];
									newList[index].deskripsi = e.target.value;
									setCpmkList(newList);
								}}
							/>
						</div>
					))}
					<button
						type="button"
						className="text-sm text-blue-600 font-semibold"
						onClick={() => alert("Tombol berhasil diklik!")}
					>
						+ Tambah CPMK
					</button>
				</section>

				{/* --- SECTION 3: SOAL & MAPPING --- */}
				<section>
					<h2 className="text-xl font-semibold mb-4 border-b pb-2">Daftar Soal & Mapping</h2>
					{soalList.map((soal, index) => (
						<div key={index} className="border p-4 rounded mb-4 bg-gray-50">
							<div className="grid grid-cols-3 gap-4 mb-4">
								<div>
									<label className="block text-sm font-medium mb-1">Pilih Induk CPMK</label>
									<select
										className="w-full border p-2 rounded"
										required
										value={soal.pemetaanCpmk.cpmk}
										onChange={(e) => {
											const newList = [...soalList];
											newList[index].pemetaanCpmk.cpmk = e.target.value;
											setSoalList(newList);
										}}
									>
										<option value="">-- Pilih CPMK --</option>
										{cpmkList.map((c, i) => (
											<option key={i} value={c.id}>
												{c.id}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Nama Sub-CPMK</label>
									<input
										type="text"
										className="w-full border p-2 rounded"
										placeholder="SCPMK 1.1"
										required
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
									<input
										type="number"
										className="w-full border p-2 rounded"
										min="0"
										max="100"
										required
										value={soal.bobotPersen}
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
								<input
									type="text"
									className="w-full border p-2 rounded"
									required
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
								<textarea
									className="w-full border p-2 rounded h-24"
									required
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
								<input
									type="file"
									accept="image/*"
									className="w-full text-sm"
									onChange={(e) => handleImageUpload(e, index)}
								/>
								{soal.kontenSoal.gambarPendukung.length > 0 && (
									<span className="text-xs text-green-600 block mt-1">✓ Gambar berhasil dilampirkan (Base64)</span>
								)}
							</div>
						</div>
					))}

					<button
						type="button"
						className="text-sm text-blue-600 font-semibold"
						onClick={() =>
							setSoalList([
								...soalList,
								{
									nomorSoal: soalList.length + 1,
									bentukSoal: "Uraian",
									uraianMateri: "",
									bobotPersen: 0,
									pemetaanCpmk: { subCpmk: "", cpmk: "" },
									kontenSoal: { teksPertanyaan: "", gambarPendukung: [] },
								},
							])
						}
					>
						+ Tambah Soal
					</button>
				</section>

				<button
					type="submit"
					disabled={isGenerating}
					className="w-full bg-blue-700 text-white font-bold py-3 rounded hover:bg-blue-800 disabled:opacity-50"
				>
					{isGenerating ? "Mencetak PDF..." : "Generate PDF Sekarang"}
				</button>
			</form>
		</main>
	);
}
