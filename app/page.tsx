"use client";

import { useState, useEffect } from "react";
// Import database statis dari folder data
import dbUjian from "../data/db_ujian.json";

// ─── Helper: decode base64 PDF → trigger download ─────────────────────────
function downloadBase64Pdf(base64: string, filename: string) {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const blob = new Blob([bytes], { type: "application/pdf" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Helper: Format Tanggal ke Bahasa Indonesia ───────────────────────────
function formatTanggalIndonesia(dateString: string) {
	if (!dateString) return "";
	const date = new Date(dateString);
	const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
	const months = [
		"Januari",
		"Februari",
		"Maret",
		"April",
		"Mei",
		"Juni",
		"Juli",
		"Agustus",
		"September",
		"Oktober",
		"November",
		"Desember",
	];
	return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function ExamGeneratorForm() {
	const [metadata, setMetadata] = useState({
		programStudi: "Teknik Elektro",
		mataKuliah: "",
		tanggalUjian: "",
		waktu: "08:00 - 08:30 (30 Menit)",
		sifatUtama: "CLOSE BOOK",
		sifatCatatan: "",
		kelompok: "",
		dosenPengampu: "",
	});

	const [cpmkList, setCpmkList] = useState([{ id: "CPMK 1", deskripsi: "" }]);

	const [soalList, setSoalList] = useState([
		{
			nomorSoal: 1,
			bentukSoal: "Essay",
			uraianMateri: "",
			bobotPersen: 0,
			pemetaanCpmk: { subCpmk: "", cpmk: "" },
			pemetaanCpmkIndustri: [] as string[],
			kontenSoal: { teksPertanyaan: "", gambarPendukung: [] as string[] },
		},
	]);

	const [pengesahan, setPengesahan] = useState({
		koordinatorMk: { nama: "", tanggal: "" },
		kaprogdi: { nama: "Dr. Ir. M. ARY HERYANTO, M.Eng., IPU., Asean.Eng.", tanggal: "" },
	});

	const [isGenerating, setIsGenerating] = useState(false);

	// ─── AUTO-UPDATE NAMA KAPROGDI BERDASARKAN PRODI ─────────────────────────
	useEffect(() => {
		let kaprogdiNama = "Dr. Ir. M. ARY HERYANTO, M.Eng., IPU., Asean.Eng."; // Default Elektro

		if (metadata.programStudi === "Teknik Industri") {
			kaprogdiNama = "Dr. HERWIN SUPRIJONO, M.T.";
		} else if (metadata.programStudi === "Teknik Biomedis") {
			kaprogdiNama = "Dr. Ir. ARIPIN, M.Kom., IPM., ASEAN Eng.";
		}

		setPengesahan((prev) => ({
			...prev,
			kaprogdi: { ...prev.kaprogdi, nama: kaprogdiNama },
		}));
	}, [metadata.programStudi]);

	// ─── CPMK handlers ──────────────────────────────────────────────────────
	const handleAddCpmk = () => {
		setCpmkList([...cpmkList, { id: `CPMK ${cpmkList.length + 1}`, deskripsi: "" }]);
	};

	const handleRemoveCpmk = (indexToRemove: number) => {
		const updated = cpmkList.filter((_, index) => index !== indexToRemove);
		const fixedOrder = updated.map((cpmk, index) => ({
			...cpmk,
			id: `CPMK ${index + 1}`,
		}));
		setCpmkList(fixedOrder);
	};

	// ─── Soal handlers ──────────────────────────────────────────────────────
	const handleAddSoal = () => {
		setSoalList([
			...soalList,
			{
				nomorSoal: soalList.length + 1,
				bentukSoal: "Essay",
				uraianMateri: "",
				bobotPersen: 0,
				pemetaanCpmk: { subCpmk: "", cpmk: "" },
				pemetaanCpmkIndustri: [],
				kontenSoal: { teksPertanyaan: "", gambarPendukung: [] },
			},
		]);
	};

	const handleRemoveSoal = (indexToRemove: number) => {
		const updated = soalList.filter((_, index) => index !== indexToRemove);
		const fixedOrder = updated.map((soal, index) => ({
			...soal,
			nomorSoal: index + 1,
		}));
		setSoalList(fixedOrder);
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

		const formattedDate = formatTanggalIndonesia(metadata.tanggalUjian);
		const formattedSifat = metadata.sifatCatatan
			? `${metadata.sifatUtama} (${metadata.sifatCatatan})`
			: metadata.sifatUtama;

		const payload = {
			templateId: metadata.programStudi === "Teknik Elektro" ? "teknik_elektro" : "teknik_industri",
			metadata: {
				...metadata,
				hariTanggal: formattedDate,
				sifat: formattedSifat,
				dosenPengampu: [metadata.dosenPengampu],
			},
			cpmkList,
			soalList,
			pengesahan,
		};

		try {
			const response = await fetch("/api/generate-pdf", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error ?? "Gagal generate PDF");
			}

			const { assessmentPdf, questionsPdf } = await response.json();

			const namaProdi = metadata.programStudi.replace(/\s+/g, "");
			downloadBase64Pdf(
				assessmentPdf,
				`${metadata.dosenPengampu}_${metadata.mataKuliah || "Ujian"}_Assessment_${namaProdi}.pdf`,
			);

			setTimeout(() => {
				downloadBase64Pdf(
					questionsPdf,
					`${metadata.dosenPengampu}_${metadata.mataKuliah || "Ujian"}_Soal_${namaProdi}.pdf`,
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
			<h1 className="text-2xl font-bold mb-6 text-center text-blue-900">Udinus Exam PDF Generator - Fakultas Teknik</h1>

			<form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
				{/* ── DATALIST DICTIONARIES ── */}
				<datalist id="list-mata-kuliah">
					{dbUjian.mataKuliah.map((mk, idx) => (
						<option key={idx} value={mk} />
					))}
				</datalist>
				<datalist id="list-dosen">
					{dbUjian.dosen.map((dsn, idx) => (
						<option key={idx} value={dsn} />
					))}
				</datalist>

				{/* ── SECTION 1: IDENTITAS UJIAN ─────────────────────────────────── */}
				<section>
					<h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Identitas Ujian</h2>
					<div className="grid grid-cols-2 gap-4">
						<div className="col-span-2 md:col-span-1">
							<label className="block text-sm font-medium mb-1">
								Program Studi <span className="text-red-500">*</span>
							</label>
							<select
								required
								className="w-full border border-blue-500 bg-blue-50 p-2 rounded font-semibold text-blue-900"
								value={metadata.programStudi}
								onChange={(e) => setMetadata({ ...metadata, programStudi: e.target.value })}
							>
								<option value="Teknik Elektro">Teknik Elektro</option>
								<option value="Teknik Industri">Teknik Industri</option>
								<option value="Teknik Biomedis">Teknik Biomedis</option>
							</select>
							<p className="text-xs text-gray-500 mt-1">Mengubah prodi akan merubah format tabel PDF.</p>
						</div>

						<div className="col-span-2 md:col-span-1">
							<label className="block text-sm font-medium mb-1">Mata Kuliah</label>
							<input
								type="text"
								required
								list="list-mata-kuliah"
								placeholder="Ketik untuk mencari mata kuliah..."
								className="w-full border border-gray-300 p-2 rounded bg-white"
								value={metadata.mataKuliah}
								onChange={(e) => setMetadata({ ...metadata, mataKuliah: e.target.value.toUpperCase() })}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Kelompok</label>
							<input
								type="text"
								placeholder="Contoh: E11.4401"
								className="w-full border border-gray-300 p-2 rounded"
								value={metadata.kelompok}
								onChange={(e) => setMetadata({ ...metadata, kelompok: e.target.value })}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Hari / Tanggal</label>
							<input
								type="date"
								required
								className="w-full border border-gray-300 p-2 rounded bg-white"
								value={metadata.tanggalUjian}
								onChange={(e) => setMetadata({ ...metadata, tanggalUjian: e.target.value })}
							/>
							{metadata.tanggalUjian && (
								<p className="text-xs text-green-600 mt-1">Preview: {formatTanggalIndonesia(metadata.tanggalUjian)}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Waktu Ujian</label>
							<select
								required
								className="w-full border border-gray-300 p-2 rounded bg-white"
								value={metadata.waktu}
								onChange={(e) => setMetadata({ ...metadata, waktu: e.target.value })}
							>
								<optgroup label="Sesi 1 (08:00)">
									<option value="08:00 - 08:30 (30 Menit)">08:00 - 08:30 (30 Menit)</option>
									<option value="08:00 - 09:00 (60 Menit)">08:00 - 09:00 (60 Menit)</option>
									<option value="08:00 - 09:30 (90 Menit)">08:00 - 09:30 (90 Menit)</option>
								</optgroup>
								<optgroup label="Sesi 2 (09:45)">
									<option value="09:45 - 10:15 (30 Menit)">09:45 - 10:15 (30 Menit)</option>
									<option value="09:45 - 10:45 (60 Menit)">09:45 - 10:45 (60 Menit)</option>
									<option value="09:45 - 11:15 (90 Menit)">09:45 - 11:15 (90 Menit)</option>
									<option value="09:45 - 11:45 (120 Menit)">09:45 - 11:45 (120 Menit)</option>
								</optgroup>
								<optgroup label="Sesi 3 (13:00)">
									<option value="13:00 - 13:30 (30 Menit)">13:00 - 13:30 (30 Menit)</option>
									<option value="13:00 - 14:00 (60 Menit)">13:00 - 14:00 (60 Menit)</option>
									<option value="13:00 - 14:30 (90 Menit)">13:00 - 14:30 (90 Menit)</option>
									<option value="13:00 - 15:00 (120 Menit)">13:00 - 15:00 (120 Menit)</option>
								</optgroup>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Dosen Pengampu</label>
							<input
								type="text"
								list="list-dosen"
								placeholder="Ketik untuk mencari nama dosen..."
								className="w-full border border-gray-300 p-2 rounded bg-white"
								value={metadata.dosenPengampu}
								onChange={(e) => setMetadata({ ...metadata, dosenPengampu: e.target.value })}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Sifat Ujian</label>
							<div className="flex gap-2">
								<select
									required
									className="w-1/2 border border-gray-300 p-2 rounded bg-white"
									value={metadata.sifatUtama}
									onChange={(e) => setMetadata({ ...metadata, sifatUtama: e.target.value })}
								>
									<option value="CLOSE BOOK">CLOSE BOOK</option>
									<option value="OPEN BOOK">OPEN BOOK</option>
									<option value="ARSIP">ARSIP</option>
									<option value="TAKE HOME">TAKE HOME</option>
								</select>
								<input
									type="text"
									placeholder="Catatan (Opsional)"
									className="w-1/2 border border-gray-300 p-2 rounded"
									value={metadata.sifatCatatan}
									onChange={(e) => setMetadata({ ...metadata, sifatCatatan: e.target.value })}
								/>
							</div>
						</div>
					</div>
				</section>

				{/* ── SECTION 2: DAFTAR CPMK ─────────────────────────────────────── */}
				<section>
					<h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Daftar CPMK</h2>
					{cpmkList.map((cpmk, index) => (
						<div key={index} className="flex gap-2 mb-3 items-center">
							<input
								type="text"
								readOnly
								className="w-1/5 border border-gray-300 p-2 rounded bg-gray-100 font-semibold"
								value={cpmk.id}
							/>
							<input
								type="text"
								required
								placeholder="Deskripsi CPMK..."
								className="flex-1 border border-gray-300 p-2 rounded"
								value={cpmk.deskripsi}
								onChange={(e) => {
									const updated = [...cpmkList];
									updated[index].deskripsi = e.target.value;
									setCpmkList(updated);
								}}
							/>
							{cpmkList.length > 1 && (
								<button
									type="button"
									onClick={() => handleRemoveCpmk(index)}
									className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition font-semibold"
								>
									✕
								</button>
							)}
						</div>
					))}
					<button
						type="button"
						onClick={handleAddCpmk}
						className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
					>
						+ Tambah CPMK
					</button>
				</section>

				{/* ── SECTION 3: SOAL & MAPPING ──────────────────────────────────── */}
				<section>
					<h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Daftar Soal &amp; Mapping</h2>
					{soalList.map((soal, index) => (
						<div key={index} className="border border-gray-300 p-4 rounded mb-6 bg-gray-50 relative">
							<div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
								<h3 className="font-bold text-lg text-blue-900">Soal No. {soal.nomorSoal}</h3>
								{soalList.length > 1 && (
									<button
										type="button"
										onClick={() => handleRemoveSoal(index)}
										className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 font-semibold transition"
									>
										Hapus Soal Ini
									</button>
								)}
							</div>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
								<div
									className={
										metadata.programStudi === "Teknik Elektro" ? "col-span-1 md:col-span-1" : "col-span-1 md:col-span-2"
									}
								>
									<label className="block text-sm font-medium mb-1">Bentuk Soal</label>
									<select
										required
										className="w-full border border-gray-300 p-2 rounded bg-white"
										value={soal.bentukSoal}
										onChange={(e) => {
											const updated = [...soalList];
											updated[index].bentukSoal = e.target.value;
											setSoalList(updated);
										}}
									>
										<option value="Essay">Essay</option>
										<option value="Pilihan Ganda">Pilihan Ganda</option>
										<option value="Uraian">Uraian</option>
									</select>
								</div>

								{/* Khusus Elektro: Butuh input ID Sub-CPMK */}
								{metadata.programStudi === "Teknik Elektro" && (
									<div className="col-span-1 md:col-span-2">
										<label className="block text-sm font-medium mb-1">ID Sub-CPMK</label>
										<input
											type="text"
											required
											placeholder="Contoh: 1, 2"
											className="w-full border border-gray-300 p-2 rounded bg-white"
											value={soal.pemetaanCpmk.subCpmk}
											onChange={(e) => {
												const updated = [...soalList];
												updated[index].pemetaanCpmk.subCpmk = e.target.value;
												setSoalList(updated);
											}}
										/>
									</div>
								)}

								<div className="col-span-2 md:col-span-1">
									<label className="block text-sm font-medium mb-1">Bobot (%)</label>
									<input
										type="number"
										required
										min="0"
										max="100"
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

							{/* CHECKBOXES UNTUK CPMK (BERLAKU UNTUK SEMUA PRODI) */}
							<div className="mb-4">
								<label className="block text-sm font-medium mb-1">
									Kaitan dengan CPMK <span className="text-gray-500 font-normal">(Bisa pilih lebih dari satu)</span>
								</label>
								<div className="flex flex-wrap gap-4 mt-2">
									{cpmkList.map((c, i) => {
										const isElektro = metadata.programStudi === "Teknik Elektro";
										const cpmkVal = c.id.replace("CPMK ", "");

										// Cek apakah CPMK ini sedang dipilih
										const isChecked = isElektro
											? soal.pemetaanCpmk.cpmk
												? soal.pemetaanCpmk.cpmk.split(", ").includes(cpmkVal)
												: false
											: soal.pemetaanCpmkIndustri.includes(c.id);

										return (
											<label
												key={i}
												className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 px-2 py-1 rounded hover:bg-blue-50"
											>
												<input
													type="checkbox"
													className="w-4 h-4 text-blue-600 rounded cursor-pointer"
													checked={isChecked}
													onChange={(e) => {
														const updated = [...soalList];

														if (isElektro) {
															let currentArr = updated[index].pemetaanCpmk.cpmk
																? updated[index].pemetaanCpmk.cpmk.split(", ")
																: [];
															if (e.target.checked) {
																if (!currentArr.includes(cpmkVal)) currentArr.push(cpmkVal);
															} else {
																currentArr = currentArr.filter((v) => v !== cpmkVal);
															}
															// Urutkan angka agar tampilannya di PDF tetap rapi (1, 2, 3)
															currentArr.sort((a, b) => parseInt(a) - parseInt(b));
															updated[index].pemetaanCpmk.cpmk = currentArr.join(", ");
														} else {
															if (e.target.checked) {
																updated[index].pemetaanCpmkIndustri.push(c.id);
															} else {
																updated[index].pemetaanCpmkIndustri = updated[index].pemetaanCpmkIndustri.filter(
																	(id) => id !== c.id,
																);
															}
														}
														setSoalList(updated);
													}}
												/>
												<span className="text-sm font-semibold">{c.id}</span>
											</label>
										);
									})}
								</div>
							</div>

							<div className="mb-4">
								<label className="block text-sm font-medium mb-1">Uraian Materi</label>
								<input
									type="text"
									required
									placeholder="Contoh: Analisis Kestabilan Sistem"
									className="w-full border border-gray-300 p-2 rounded bg-white"
									value={soal.uraianMateri}
									onChange={(e) => {
										const updated = [...soalList];
										updated[index].uraianMateri = e.target.value;
										setSoalList(updated);
									}}
								/>
							</div>

							{/* KEMBALI MENGGUNAKAN TEXTAREA BIASA */}
							<div className="mb-4">
								<label className="block text-sm font-medium mb-1">Teks Pertanyaan</label>
								<textarea
									required
									placeholder="Tuliskan pertanyaan ujian di sini..."
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
								<label className="block text-sm font-medium mb-1">Gambar Pendukung (Opsional)</label>
								<input
									type="file"
									accept="image/*"
									className="w-full text-sm bg-white border border-gray-300 p-1 rounded"
									onChange={(e) => handleImageUpload(e, index)}
								/>
								{soal.kontenSoal.gambarPendukung.length > 0 && (
									<span className="text-xs text-green-600 block mt-2 font-semibold">✓ Gambar berhasil dilampirkan</span>
								)}
							</div>
						</div>
					))}
					<button
						type="button"
						onClick={handleAddSoal}
						className="text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
					>
						+ Tambah Soal
					</button>
				</section>

				{/* ── SECTION 4: PENGESAHAN ──────────────────────────────────────── */}
				<section>
					<h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Pengesahan</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Nama Koordinator MK</label>
							<input
								type="text"
								required
								list="list-dosen"
								placeholder="Ketik untuk mencari nama koordinator..."
								className="w-full border border-gray-300 p-2 rounded bg-white"
								value={pengesahan.koordinatorMk.nama}
								onChange={(e) =>
									setPengesahan({ ...pengesahan, koordinatorMk: { ...pengesahan.koordinatorMk, nama: e.target.value } })
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Tanggal Koordinator MK</label>
							<input
								type="date"
								required
								className="w-full border border-gray-300 p-2 rounded bg-white"
								value={pengesahan.koordinatorMk.tanggal}
								onChange={(e) =>
									setPengesahan({
										...pengesahan,
										koordinatorMk: { ...pengesahan.koordinatorMk, tanggal: e.target.value },
									})
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Nama Kaprogdi</label>
							<input
								type="text"
								required
								className="w-full border border-gray-300 p-2 rounded select-none"
								value={pengesahan.kaprogdi.nama}
								onChange={(e) =>
									setPengesahan({ ...pengesahan, kaprogdi: { ...pengesahan.kaprogdi, nama: e.target.value } })
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Tanggal Kaprogdi</label>
							<input
								type="date"
								required
								className="w-full border border-gray-300 p-2 rounded bg-white"
								value={pengesahan.kaprogdi.tanggal}
								onChange={(e) =>
									setPengesahan({ ...pengesahan, kaprogdi: { ...pengesahan.kaprogdi, tanggal: e.target.value } })
								}
							/>
						</div>
					</div>
				</section>

				<button
					type="submit"
					disabled={isGenerating}
					className="w-full bg-blue-700 text-white font-bold py-3 rounded hover:bg-blue-800 disabled:opacity-50 transition duration-200 shadow-md"
				>
					{isGenerating ? "Membuat PDF... (mohon tunggu)" : "Generate 2 PDF Sekarang (Assessment + Soal)"}
				</button>
			</form>
		</main>
	);
}
