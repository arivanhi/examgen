"use client";
import { useState, useEffect } from "react";
import dbUjian from "../data/db_ujian.json";

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

	useEffect(() => {
		let kaprogdiNama = "Dr. Ir. M. ARY HERYANTO, M.Eng., IPU., Asean.Eng.";
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

	const handleAddCpmk = () => {
		setCpmkList([...cpmkList, { id: `CPMK ${cpmkList.length + 1}`, deskripsi: "" }]);
	};
	const handleRemoveCpmk = (indexToRemove: number) => {
		const updated = cpmkList.filter((_, index) => index !== indexToRemove);
		setCpmkList(updated.map((cpmk, index) => ({ ...cpmk, id: `CPMK ${index + 1}` })));
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
				pemetaanCpmkIndustri: [],
				kontenSoal: { teksPertanyaan: "", gambarPendukung: [] },
			},
		]);
	};
	const handleRemoveSoal = (indexToRemove: number) => {
		const updated = soalList.filter((_, index) => index !== indexToRemove);
		setSoalList(updated.map((soal, index) => ({ ...soal, nomorSoal: index + 1 })));
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

	const isElektro = metadata.programStudi === "Teknik Elektro";

	return (
		<>
			<style>{`
				.eg-root {
					min-height: 100vh;
					background: #f5f5f4;
					font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
					color: #1a1a1a;
				}
				.eg-topbar {
					background: #fff;
					border-bottom: 1px solid #e5e5e5;
					padding: 0 24px;
					height: 56px;
					display: flex;
					align-items: center;
					gap: 10px;
					position: sticky;
					top: 0;
					z-index: 10;
				}
				.eg-topbar-logo {
					width: 28px;
					height: 28px;
					background: #1d4ed8;
					border-radius: 6px;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.eg-topbar-logo svg {
					width: 16px;
					height: 16px;
					stroke: #fff;
					fill: none;
					stroke-width: 2;
					stroke-linecap: round;
					stroke-linejoin: round;
				}
				.eg-topbar-title {
					font-size: 14px;
					font-weight: 600;
					color: #111;
				}
				.eg-topbar-sub {
					font-size: 13px;
					color: #6b7280;
					margin-left: 2px;
				}
				.eg-topbar-divider {
					width: 1px;
					height: 18px;
					background: #e5e5e5;
					margin: 0 4px;
				}
				.eg-body {
					max-width: 760px;
					margin: 0 auto;
					padding: 32px 24px 80px;
				}
				.eg-section {
					background: #fff;
					border: 1px solid #e5e5e5;
					border-radius: 12px;
					margin-bottom: 16px;
					overflow: hidden;
				}
				.eg-section-header {
					padding: 16px 20px;
					border-bottom: 1px solid #f0f0f0;
					display: flex;
					align-items: center;
					gap: 10px;
				}
				.eg-section-icon {
					width: 28px;
					height: 28px;
					border-radius: 6px;
					background: #eff6ff;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.eg-section-icon svg {
					width: 14px;
					height: 14px;
					stroke: #1d4ed8;
					fill: none;
					stroke-width: 2;
					stroke-linecap: round;
					stroke-linejoin: round;
				}
				.eg-section-title {
					font-size: 13px;
					font-weight: 600;
					color: #111;
					letter-spacing: 0.01em;
				}
				.eg-section-body {
					padding: 20px;
				}
				.eg-grid-2 {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 14px;
				}
				.eg-grid-3 {
					display: grid;
					grid-template-columns: 1fr 1fr 1fr;
					gap: 14px;
				}
				.eg-col-span-2 {
					grid-column: span 2;
				}
				.eg-field label {
					display: block;
					font-size: 11.5px;
					font-weight: 500;
					color: #6b7280;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					margin-bottom: 6px;
				}
				.eg-field input,
				.eg-field select,
				.eg-field textarea {
					width: 100%;
					border: 1px solid #e5e5e5;
					border-radius: 8px;
					padding: 8px 11px;
					font-size: 13.5px;
					color: #111;
					background: #fff;
					outline: none;
					transition: border-color 0.15s;
					font-family: inherit;
					box-sizing: border-box;
				}
				.eg-field input:focus,
				.eg-field select:focus,
				.eg-field textarea:focus {
					border-color: #1d4ed8;
					box-shadow: 0 0 0 3px rgba(29,78,216,0.08);
				}
				.eg-field textarea {
					resize: vertical;
					min-height: 88px;
					line-height: 1.5;
				}
				.eg-field .eg-hint {
					font-size: 11.5px;
					color: #9ca3af;
					margin-top: 4px;
				}
				.eg-field .eg-hint.success {
					color: #16a34a;
				}
				.eg-prodi-select {
					border-color: #bfdbfe !important;
					background: #eff6ff !important;
					color: #1d4ed8 !important;
					font-weight: 600 !important;
				}
				.eg-cpmk-row {
					display: flex;
					gap: 8px;
					align-items: center;
					margin-bottom: 8px;
				}
				.eg-cpmk-row .eg-cpmk-id {
					width: 80px;
					flex-shrink: 0;
					border: 1px solid #e5e5e5;
					border-radius: 8px;
					padding: 8px 11px;
					font-size: 13px;
					font-weight: 600;
					color: #374151;
					background: #f9fafb;
					text-align: center;
				}
				.eg-cpmk-row input[type="text"] {
					flex: 1;
					border: 1px solid #e5e5e5;
					border-radius: 8px;
					padding: 8px 11px;
					font-size: 13.5px;
					color: #111;
					background: #fff;
					outline: none;
					font-family: inherit;
				}
				.eg-cpmk-row input[type="text"]:focus {
					border-color: #1d4ed8;
					box-shadow: 0 0 0 3px rgba(29,78,216,0.08);
				}
				.eg-btn-ghost {
					background: none;
					border: none;
					cursor: pointer;
					padding: 0;
					font-family: inherit;
				}
				.eg-btn-remove {
					width: 28px;
					height: 28px;
					border-radius: 6px;
					background: #fef2f2;
					border: none;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
					transition: background 0.15s;
				}
				.eg-btn-remove:hover {
					background: #fee2e2;
				}
				.eg-btn-remove svg {
					width: 12px;
					height: 12px;
					stroke: #dc2626;
					fill: none;
					stroke-width: 2.5;
					stroke-linecap: round;
				}
				.eg-btn-add {
					display: inline-flex;
					align-items: center;
					gap: 5px;
					font-size: 13px;
					font-weight: 500;
					color: #1d4ed8;
					background: none;
					border: none;
					cursor: pointer;
					padding: 6px 0;
					font-family: inherit;
					transition: color 0.15s;
				}
				.eg-btn-add:hover {
					color: #1e40af;
				}
				.eg-soal-card {
					border: 1px solid #e5e5e5;
					border-radius: 10px;
					margin-bottom: 12px;
					overflow: hidden;
				}
				.eg-soal-card-header {
					padding: 11px 16px;
					background: #fafafa;
					border-bottom: 1px solid #f0f0f0;
					display: flex;
					align-items: center;
					justify-content: space-between;
				}
				.eg-soal-num {
					font-size: 12px;
					font-weight: 600;
					color: #6b7280;
					text-transform: uppercase;
					letter-spacing: 0.06em;
				}
				.eg-soal-body {
					padding: 16px;
					display: flex;
					flex-direction: column;
					gap: 14px;
				}
				.eg-cpmk-chips {
					display: flex;
					flex-wrap: wrap;
					gap: 6px;
					margin-top: 6px;
				}
				.eg-chip-label {
					display: flex;
					align-items: center;
					gap: 6px;
					padding: 5px 10px;
					border-radius: 6px;
					border: 1px solid #e5e5e5;
					background: #fff;
					cursor: pointer;
					font-size: 12.5px;
					font-weight: 500;
					color: #374151;
					transition: all 0.12s;
				}
				.eg-chip-label:hover {
					border-color: #bfdbfe;
					background: #eff6ff;
				}
				.eg-chip-label input[type="checkbox"] {
					width: 14px;
					height: 14px;
					accent-color: #1d4ed8;
					cursor: pointer;
					flex-shrink: 0;
				}
				.eg-chip-label.checked {
					border-color: #1d4ed8;
					background: #eff6ff;
					color: #1d4ed8;
				}
				.eg-sifat-row {
					display: flex;
					gap: 8px;
				}
				.eg-sifat-row select {
					flex: 1;
					border: 1px solid #e5e5e5;
					border-radius: 8px;
					padding: 8px 11px;
					font-size: 13.5px;
					background: #fff;
					outline: none;
					font-family: inherit;
					color: #111;
				}
				.eg-sifat-row select:focus {
					border-color: #1d4ed8;
					box-shadow: 0 0 0 3px rgba(29,78,216,0.08);
				}
				.eg-sifat-row input {
					flex: 1;
					border: 1px solid #e5e5e5;
					border-radius: 8px;
					padding: 8px 11px;
					font-size: 13.5px;
					background: #fff;
					outline: none;
					font-family: inherit;
					color: #111;
				}
				.eg-sifat-row input:focus {
					border-color: #1d4ed8;
					box-shadow: 0 0 0 3px rgba(29,78,216,0.08);
				}
				.eg-divider {
					height: 1px;
					background: #f0f0f0;
					margin: 4px 0 16px;
				}
				.eg-submit-bar {
					position: fixed;
					bottom: 0;
					left: 0;
					right: 0;
					background: rgba(255,255,255,0.92);
					backdrop-filter: blur(12px);
					border-top: 1px solid #e5e5e5;
					padding: 14px 24px;
					display: flex;
					justify-content: center;
					z-index: 20;
				}
				.eg-submit-btn {
					background: #1d4ed8;
					color: #fff;
					border: none;
					border-radius: 9px;
					padding: 11px 32px;
					font-size: 14px;
					font-weight: 600;
					cursor: pointer;
					font-family: inherit;
					transition: background 0.15s, opacity 0.15s;
					display: flex;
					align-items: center;
					gap: 8px;
					min-width: 320px;
					justify-content: center;
				}
				.eg-submit-btn:hover:not(:disabled) {
					background: #1e40af;
				}
				.eg-submit-btn:disabled {
					opacity: 0.55;
					cursor: not-allowed;
				}
				.eg-submit-btn svg {
					width: 16px;
					height: 16px;
					stroke: #fff;
					fill: none;
					stroke-width: 2;
					stroke-linecap: round;
					stroke-linejoin: round;
				}
				.eg-file-upload {
					width: 100%;
					border: 1px dashed #d1d5db;
					border-radius: 8px;
					padding: 10px 12px;
					font-size: 13px;
					color: #6b7280;
					background: #fafafa;
					cursor: pointer;
					box-sizing: border-box;
				}
				.eg-file-upload:hover {
					border-color: #1d4ed8;
					background: #eff6ff;
				}
				.eg-success-badge {
					display: inline-flex;
					align-items: center;
					gap: 4px;
					font-size: 11.5px;
					color: #16a34a;
					background: #f0fdf4;
					border: 1px solid #bbf7d0;
					border-radius: 5px;
					padding: 3px 8px;
					margin-top: 6px;
				}
				@media (max-width: 600px) {
					.eg-grid-2 { grid-template-columns: 1fr; }
					.eg-grid-3 { grid-template-columns: 1fr; }
					.eg-col-span-2 { grid-column: span 1; }
					.eg-body { padding: 16px 14px 80px; }
					.eg-submit-btn { min-width: unset; width: 100%; }
				}
			`}</style>

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

			<div className="eg-root">
				{/* Top Bar */}
				<div className="eg-topbar">
					<div className="eg-topbar-logo">
						<svg viewBox="0 0 24 24">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="16" y1="13" x2="8" y2="13" />
							<line x1="16" y1="17" x2="8" y2="17" />
						</svg>
					</div>
					<span className="eg-topbar-title">Exam Generator</span>
					<div className="eg-topbar-divider" />
					<span className="eg-topbar-sub">Fakultas Teknik UDINUS</span>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="eg-body">
						{/* Section 1: Identitas */}
						<div className="eg-section">
							<div className="eg-section-header">
								<div className="eg-section-icon">
									<svg viewBox="0 0 24 24">
										<rect x="3" y="4" width="18" height="18" rx="2" />
										<line x1="16" y1="2" x2="16" y2="6" />
										<line x1="8" y1="2" x2="8" y2="6" />
										<line x1="3" y1="10" x2="21" y2="10" />
									</svg>
								</div>
								<span className="eg-section-title">Identitas Ujian</span>
							</div>
							<div className="eg-section-body">
								<div className="eg-grid-2">
									<div className="eg-field">
										<label>
											Program Studi <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<select
											required
											className="eg-prodi-select"
											value={metadata.programStudi}
											onChange={(e) => setMetadata({ ...metadata, programStudi: e.target.value })}
											style={{
												width: "100%",
												borderRadius: "8px",
												padding: "8px 11px",
												fontSize: "13.5px",
												fontFamily: "inherit",
												outline: "none",
												boxSizing: "border-box" as const,
												cursor: "pointer",
												fontWeight: 600,
											}}
										>
											<option value="Teknik Elektro">Teknik Elektro</option>
											<option value="Teknik Industri">Teknik Industri</option>
											<option value="Teknik Biomedis">Teknik Biomedis</option>
										</select>
										<p className="eg-hint">Mengubah prodi akan merubah format tabel PDF.</p>
									</div>
									<div className="eg-field">
										<label>
											Mata Kuliah <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="text"
											required
											list="list-mata-kuliah"
											placeholder="Cari atau ketik nama mata kuliah..."
											value={metadata.mataKuliah}
											onChange={(e) => setMetadata({ ...metadata, mataKuliah: e.target.value.toUpperCase() })}
										/>
									</div>
									<div className="eg-field">
										<label>Kelompok</label>
										<input
											type="text"
											placeholder="Contoh: E11.4401"
											value={metadata.kelompok}
											onChange={(e) => setMetadata({ ...metadata, kelompok: e.target.value })}
										/>
									</div>
									<div className="eg-field">
										<label>
											Hari / Tanggal <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="date"
											required
											value={metadata.tanggalUjian}
											onChange={(e) => setMetadata({ ...metadata, tanggalUjian: e.target.value })}
										/>
										{metadata.tanggalUjian && (
											<p className="eg-hint success">{formatTanggalIndonesia(metadata.tanggalUjian)}</p>
										)}
									</div>
									<div className="eg-field">
										<label>Dosen Pengampu</label>
										<input
											type="text"
											list="list-dosen"
											placeholder="Cari atau ketik nama dosen..."
											value={metadata.dosenPengampu}
											onChange={(e) => setMetadata({ ...metadata, dosenPengampu: e.target.value })}
										/>
									</div>
									<div className="eg-field">
										<label>
											Waktu Ujian <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<select
											required
											value={metadata.waktu}
											onChange={(e) => setMetadata({ ...metadata, waktu: e.target.value })}
											style={{
												width: "100%",
												borderRadius: "8px",
												padding: "8px 11px",
												fontSize: "13.5px",
												fontFamily: "inherit",
												outline: "none",
												boxSizing: "border-box" as const,
												border: "1px solid #e5e5e5",
												color: "#111",
												background: "#fff",
											}}
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
									<div className="eg-field eg-col-span-2">
										<label>
											Sifat Ujian <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<div className="eg-sifat-row">
											<select
												required
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
												placeholder="Catatan tambahan (opsional)"
												value={metadata.sifatCatatan}
												onChange={(e) => setMetadata({ ...metadata, sifatCatatan: e.target.value })}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Section 2: CPMK */}
						<div className="eg-section">
							<div className="eg-section-header">
								<div className="eg-section-icon">
									<svg viewBox="0 0 24 24">
										<path d="M9 11l3 3L22 4" />
										<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
									</svg>
								</div>
								<span className="eg-section-title">Daftar CPMK</span>
							</div>
							<div className="eg-section-body">
								{cpmkList.map((cpmk, index) => (
									<div key={index} className="eg-cpmk-row">
										<div className="eg-cpmk-id">{cpmk.id}</div>
										<input
											type="text"
											required
											placeholder="Deskripsi capaian pembelajaran..."
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
												className="eg-btn-remove"
												onClick={() => handleRemoveCpmk(index)}
												title="Hapus CPMK"
											>
												<svg viewBox="0 0 24 24">
													<line x1="18" y1="6" x2="6" y2="18" />
													<line x1="6" y1="6" x2="18" y2="18" />
												</svg>
											</button>
										)}
									</div>
								))}
								<button type="button" className="eg-btn-add" onClick={handleAddCpmk}>
									<svg
										viewBox="0 0 24 24"
										width="14"
										height="14"
										style={{ stroke: "currentColor", fill: "none", strokeWidth: 2.5, strokeLinecap: "round" as const }}
									>
										<line x1="12" y1="5" x2="12" y2="19" />
										<line x1="5" y1="12" x2="19" y2="12" />
									</svg>
									Tambah CPMK
								</button>
							</div>
						</div>

						{/* Section 3: Soal */}
						<div className="eg-section">
							<div className="eg-section-header">
								<div className="eg-section-icon">
									<svg viewBox="0 0 24 24">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
									</svg>
								</div>
								<span className="eg-section-title">Daftar Soal &amp; Mapping</span>
							</div>
							<div className="eg-section-body">
								{soalList.map((soal, index) => (
									<div key={index} className="eg-soal-card">
										<div className="eg-soal-card-header">
											<span className="eg-soal-num">Soal {soal.nomorSoal}</span>
											{soalList.length > 1 && (
												<button
													type="button"
													className="eg-btn-remove"
													onClick={() => handleRemoveSoal(index)}
													title="Hapus soal ini"
												>
													<svg viewBox="0 0 24 24">
														<line x1="18" y1="6" x2="6" y2="18" />
														<line x1="6" y1="6" x2="18" y2="18" />
													</svg>
												</button>
											)}
										</div>
										<div className="eg-soal-body">
											<div className={`eg-grid-${isElektro ? "3" : "2"}`}>
												<div className="eg-field">
													<label>Bentuk Soal</label>
													<select
														required
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
												{isElektro && (
													<div className="eg-field">
														<label>ID Sub-CPMK</label>
														<input
															type="text"
															required
															placeholder="Contoh: 1, 2"
															value={soal.pemetaanCpmk.subCpmk}
															onChange={(e) => {
																const updated = [...soalList];
																updated[index].pemetaanCpmk.subCpmk = e.target.value;
																setSoalList(updated);
															}}
														/>
													</div>
												)}
												<div className="eg-field">
													<label>Bobot (%)</label>
													<input
														type="number"
														required
														min="0"
														max="100"
														value={soal.bobotPersen === 0 ? "" : soal.bobotPersen}
														onChange={(e) => {
															const updated = [...soalList];
															updated[index].bobotPersen = Number(e.target.value);
															setSoalList(updated);
														}}
													/>
												</div>
											</div>

											<div className="eg-field">
												<label>
													Kaitan CPMK{" "}
													<span
														style={{
															fontWeight: 400,
															textTransform: "none" as const,
															color: "#9ca3af",
															fontSize: "11px",
														}}
													>
														Bisa lebih dari satu
													</span>
												</label>
												<div className="eg-cpmk-chips">
													{cpmkList.map((c, i) => {
														const cpmkVal = c.id.replace("CPMK ", "");
														const isChecked = isElektro
															? soal.pemetaanCpmk.cpmk
																? soal.pemetaanCpmk.cpmk.split(", ").includes(cpmkVal)
																: false
															: soal.pemetaanCpmkIndustri.includes(c.id);
														return (
															<label key={i} className={`eg-chip-label${isChecked ? " checked" : ""}`}>
																<input
																	type="checkbox"
																	checked={isChecked}
																	onChange={(e) => {
																		const updated = [...soalList];
																		if (isElektro) {
																			let arr = updated[index].pemetaanCpmk.cpmk
																				? updated[index].pemetaanCpmk.cpmk.split(", ")
																				: [];
																			if (e.target.checked) {
																				if (!arr.includes(cpmkVal)) arr.push(cpmkVal);
																			} else {
																				arr = arr.filter((v) => v !== cpmkVal);
																			}
																			arr.sort((a, b) => parseInt(a) - parseInt(b));
																			updated[index].pemetaanCpmk.cpmk = arr.join(", ");
																		} else {
																			if (e.target.checked) {
																				updated[index].pemetaanCpmkIndustri.push(c.id);
																			} else {
																				updated[index].pemetaanCpmkIndustri = updated[
																					index
																				].pemetaanCpmkIndustri.filter((id) => id !== c.id);
																			}
																		}
																		setSoalList(updated);
																	}}
																/>
																{c.id}
															</label>
														);
													})}
												</div>
											</div>

											<div className="eg-field">
												<label>Uraian Materi</label>
												<input
													type="text"
													required
													placeholder="Contoh: Analisis Kestabilan Sistem"
													value={soal.uraianMateri}
													onChange={(e) => {
														const updated = [...soalList];
														updated[index].uraianMateri = e.target.value;
														setSoalList(updated);
													}}
												/>
											</div>

											<div className="eg-field">
												<label>Teks Pertanyaan</label>
												<textarea
													required
													placeholder="Tuliskan pertanyaan ujian di sini..."
													value={soal.kontenSoal.teksPertanyaan}
													onChange={(e) => {
														const updated = [...soalList];
														updated[index].kontenSoal.teksPertanyaan = e.target.value;
														setSoalList(updated);
													}}
												/>
											</div>

											<div className="eg-field">
												<label>
													Gambar Pendukung{" "}
													<span
														style={{
															fontWeight: 400,
															textTransform: "none" as const,
															color: "#9ca3af",
															fontSize: "11px",
														}}
													>
														Opsional
													</span>
												</label>
												<input
													type="file"
													accept="image/*"
													className="eg-file-upload"
													onChange={(e) => handleImageUpload(e, index)}
												/>
												{soal.kontenSoal.gambarPendukung.length > 0 && (
													<span className="eg-success-badge">
														<svg
															viewBox="0 0 24 24"
															width="12"
															height="12"
															style={{
																stroke: "#16a34a",
																fill: "none",
																strokeWidth: 2.5,
																strokeLinecap: "round" as const,
																strokeLinejoin: "round" as const,
															}}
														>
															<polyline points="20 6 9 17 4 12" />
														</svg>
														Gambar berhasil dilampirkan
													</span>
												)}
											</div>
										</div>
									</div>
								))}
								<button type="button" className="eg-btn-add" onClick={handleAddSoal}>
									<svg
										viewBox="0 0 24 24"
										width="14"
										height="14"
										style={{ stroke: "currentColor", fill: "none", strokeWidth: 2.5, strokeLinecap: "round" as const }}
									>
										<line x1="12" y1="5" x2="12" y2="19" />
										<line x1="5" y1="12" x2="19" y2="12" />
									</svg>
									Tambah Soal
								</button>
							</div>
						</div>

						{/* Section 4: Pengesahan */}
						<div className="eg-section">
							<div className="eg-section-header">
								<div className="eg-section-icon">
									<svg viewBox="0 0 24 24">
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
									</svg>
								</div>
								<span className="eg-section-title">Pengesahan</span>
							</div>
							<div className="eg-section-body">
								<div className="eg-grid-2">
									<div className="eg-field">
										<label>
											Nama Koordinator MK <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="text"
											required
											list="list-dosen"
											placeholder="Cari atau ketik nama koordinator..."
											value={pengesahan.koordinatorMk.nama}
											onChange={(e) =>
												setPengesahan({
													...pengesahan,
													koordinatorMk: { ...pengesahan.koordinatorMk, nama: e.target.value },
												})
											}
										/>
									</div>
									<div className="eg-field">
										<label>
											Tanggal Koordinator MK <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="date"
											required
											value={pengesahan.koordinatorMk.tanggal}
											onChange={(e) =>
												setPengesahan({
													...pengesahan,
													koordinatorMk: { ...pengesahan.koordinatorMk, tanggal: e.target.value },
												})
											}
										/>
									</div>
									<div className="eg-field">
										<label>
											Nama Kaprogdi <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="text"
											required
											value={pengesahan.kaprogdi.nama}
											onChange={(e) =>
												setPengesahan({ ...pengesahan, kaprogdi: { ...pengesahan.kaprogdi, nama: e.target.value } })
											}
										/>
									</div>
									<div className="eg-field">
										<label>
											Tanggal Kaprogdi <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="date"
											required
											value={pengesahan.kaprogdi.tanggal}
											onChange={(e) =>
												setPengesahan({ ...pengesahan, kaprogdi: { ...pengesahan.kaprogdi, tanggal: e.target.value } })
											}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Sticky Submit Bar */}
					<div className="eg-submit-bar">
						<button type="submit" disabled={isGenerating} className="eg-submit-btn">
							{isGenerating ? (
								<>
									<svg viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Membuat PDF...
									<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
								</>
							) : (
								<>
									<svg viewBox="0 0 24 24">
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
										<polyline points="7 10 12 15 17 10" />
										<line x1="12" y1="15" x2="12" y2="3" />
									</svg>
									Generate 2 PDF — Assessment &amp; Soal
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
