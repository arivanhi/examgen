"use client";

import { useState, useEffect } from "react";
import dbUjian from "../data/db_ujian.json";

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
		dosenPengampu: [""],
	});

	const [cpmkList, setCpmkList] = useState([{ id: "CPMK 1", deskripsi: "" }]);

	const [soalList, setSoalList] = useState([
		{
			nomorSoal: 1,
			bentukSoal: "Essay",
			uraianMateri: "",
			bobotPersen: 0,
			tampilBobot: true,
			pemetaanCpmk: { subCpmk: "", cpmk: "" },
			pemetaanCpmkIndustri: [] as string[],
			kontenSoal: { teksPertanyaan: "", gambarPendukung: [] as string[] },
			posisiGambar: "Atas",
		},
	]);

	const [pengesahan, setPengesahan] = useState({
		koordinatorMk: { nama: "", tanggal: "" },
		kaprogdi: { nama: "Dr. Ir. M. ARY HERYANTO, M.Eng., IPU., Asean.Eng.", tanggal: "" },
	});

	const [isGenerating, setIsGenerating] = useState(false);

	useEffect(() => {
		let kaprogdiNama = "Dr. Ir. M. ARY HERYANTO, M.Eng., IPU., Asean.Eng.";
		if (metadata.programStudi === "Teknik Industri") kaprogdiNama = "Dr. HERWIN SUPRIJONO, M.T.";
		else if (metadata.programStudi === "Teknik Biomedis") kaprogdiNama = "Dr. Ir. ARIPIN, M.Kom., IPM., ASEAN Eng.";
		setPengesahan((prev) => ({ ...prev, kaprogdi: { ...prev.kaprogdi, nama: kaprogdiNama } }));
	}, [metadata.programStudi]);

	const handleAddDosen = () => setMetadata({ ...metadata, dosenPengampu: [...metadata.dosenPengampu, ""] });
	const handleRemoveDosen = (index: number) => {
		const updated = metadata.dosenPengampu.filter((_, i) => i !== index);
		setMetadata({ ...metadata, dosenPengampu: updated });
	};
	const handleChangeDosen = (index: number, value: string) => {
		const updated = [...metadata.dosenPengampu];
		updated[index] = value;
		setMetadata({ ...metadata, dosenPengampu: updated });
	};

	const handleAddCpmk = () => setCpmkList([...cpmkList, { id: `CPMK ${cpmkList.length + 1}`, deskripsi: "" }]);
	const handleRemoveCpmk = (i: number) => {
		const updated = cpmkList.filter((_, idx) => idx !== i);
		setCpmkList(updated.map((c, idx) => ({ ...c, id: `CPMK ${idx + 1}` })));
	};

	const handleAddSoal = () =>
		setSoalList([
			...soalList,
			{
				nomorSoal: soalList.length + 1,
				bentukSoal: "Essay",
				uraianMateri: "",
				bobotPersen: 0,
				tampilBobot: true,
				pemetaanCpmk: { subCpmk: "", cpmk: "" },
				pemetaanCpmkIndustri: [],
				kontenSoal: { teksPertanyaan: "", gambarPendukung: [] },
				posisiGambar: "Atas",
			},
		]);

	const handleRemoveSoal = (i: number) => {
		const updated = soalList.filter((_, idx) => idx !== i);
		setSoalList(updated.map((s, idx) => ({ ...s, nomorSoal: idx + 1 })));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, soalIndex: number) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onloadend = () => {
			const updated = [...soalList];
			updated[soalIndex].kontenSoal.gambarPendukung = [reader.result as string];
			setSoalList(updated);
		};
		reader.readAsDataURL(file);
	};

	// ─── FITUR BARU: RESET FORM ───
	const handleResetForm = () => {
		const confirmReset = window.confirm("Apakah Anda yakin ingin mengosongkan semua isian form ini?");
		if (!confirmReset) return;

		// Kembalikan ke default bawaan
		setMetadata({
			programStudi: "Teknik Elektro",
			mataKuliah: "",
			tanggalUjian: "",
			waktu: "08:00 - 08:30 (30 Menit)",
			sifatUtama: "CLOSE BOOK",
			sifatCatatan: "",
			kelompok: "",
			dosenPengampu: [""],
		});

		setCpmkList([{ id: "CPMK 1", deskripsi: "" }]);

		setSoalList([
			{
				nomorSoal: 1,
				bentukSoal: "Essay",
				uraianMateri: "",
				bobotPersen: 0,
				tampilBobot: true,
				pemetaanCpmk: { subCpmk: "", cpmk: "" },
				pemetaanCpmkIndustri: [],
				kontenSoal: { teksPertanyaan: "", gambarPendukung: [] },
				posisiGambar: "Atas",
			},
		]);

		setPengesahan({
			koordinatorMk: { nama: "", tanggal: "" },
			kaprogdi: { nama: "Dr. Ir. M. ARY HERYANTO, M.Eng., IPU., Asean.Eng.", tanggal: "" },
		});

		// Scroll kembali ke atas
		window.scrollTo({ top: 0, behavior: "smooth" });
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
				dosenPengampu: metadata.dosenPengampu,
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

			const JSZip = (await import("jszip")).default;
			const namaProdi = metadata.programStudi.replace(/\s+/g, "");
			const namaMatkul = metadata.mataKuliah ? metadata.mataKuliah.replace(/[^a-zA-Z0-9.\- ]/g, "").trim() : "Ujian";

			let daftarDosen = metadata.dosenPengampu.filter((d) => d.trim() !== "");
			if (daftarDosen.length === 0) daftarDosen = ["Tanpa_Nama"];

			for (let i = 0; i < daftarDosen.length; i++) {
				const namaDosen = daftarDosen[i].replace(/[^a-zA-Z0-9.\- ]/g, "").trim();
				const zip = new JSZip();

				const folderDosen = zip.folder(`${namaDosen}`);

				if (folderDosen) {
					folderDosen.file(`${namaMatkul}_Assessment_${namaProdi}.pdf`, assessmentPdf, { base64: true });
					folderDosen.file(`${namaMatkul}_Soal_${namaProdi}.pdf`, questionsPdf, { base64: true });
				}

				const zipContent = await zip.generateAsync({ type: "blob" });
				const url = URL.createObjectURL(zipContent);

				const a = document.createElement("a");
				a.href = url;
				a.download = `${namaDosen}.zip`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				if (i < daftarDosen.length - 1) {
					await new Promise((resolve) => setTimeout(resolve, 800));
				}
			}
		} catch (error) {
			console.error(error);
			alert("Terjadi kesalahan: " + String(error));
		} finally {
			setIsGenerating(false);
		}
	};

	const isElektro = metadata.programStudi === "Teknik Elektro";

	// ── SVG Icons ──────────────────────────────────────────────────────────
	const IconCalendar = () => (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</svg>
	);
	const IconCheck = () => (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M9 11l3 3L22 4" />
			<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
		</svg>
	);
	const IconShield = () => (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
		</svg>
	);
	const IconEdit = () => (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
		</svg>
	);
	const IconPlus = () => (
		<svg
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
		>
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	);
	const IconX = () => (
		<svg
			viewBox="0 0 24 24"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	);
	const IconDownload = () => (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	);
	const IconTrash = () => (
		<svg
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="3 6 5 6 21 6"></polyline>
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
		</svg>
	);

	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .eg-root {
                    min-height: 100vh;
                    background: #f1f5f9;
                    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
                    color: #0f172a;
                }

                .eg-topbar {
                    background: #fff;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 0 28px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }
                .eg-topbar-logo {
                    width: 32px; height: 32px;
                    background: #2563eb;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    color: #fff;
                }
                .eg-topbar-logo svg { width: 17px; height: 17px; }
                .eg-topbar-title { font-size: 15px; font-weight: 700; color: #0f172a; }
                .eg-topbar-divider { width: 1px; height: 18px; background: #e2e8f0; margin: 0 4px; }
                .eg-topbar-sub { font-size: 13px; color: #94a3b8; }

                .eg-layout {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 0;
                    min-height: calc(100vh - 58px);
                }

                .eg-left {
                    background: #fff;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    overflow-y: auto;
                    max-height: calc(100vh - 58px);
                    position: sticky;
                    top: 58px;
                    padding-bottom: 100px;
                }

                .eg-right {
                    background: #f1f5f9;
                    padding: 24px 28px 120px;
                    overflow-y: auto;
                }

                .eg-panel { border-bottom: 1px solid #f1f5f9; }
                .eg-panel-header {
                    padding: 14px 20px;
                    display: flex; align-items: center; gap: 10px;
                    background: #fafafa; border-bottom: 1px solid #f1f5f9;
                    cursor: default;
                }
                .eg-panel-icon {
                    width: 26px; height: 26px; border-radius: 6px;
                    background: #eff6ff; display: flex; align-items: center; justify-content: center;
                    color: #2563eb; flex-shrink: 0;
                }
                .eg-panel-icon svg { width: 13px; height: 13px; }
                .eg-panel-title { font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.06em; }
                .eg-panel-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }

                .eg-field { display: flex; flex-direction: column; gap: 5px; }
                .eg-field label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
                .eg-field input, .eg-field select, .eg-field textarea {
                    width: 100%; border: 1px solid #e2e8f0; border-radius: 7px;
                    padding: 8px 11px; font-size: 13.5px; color: #0f172a;
                    background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit;
                }
                .eg-field input:focus, .eg-field select:focus, .eg-field textarea:focus {
                    border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }
                .eg-field textarea { resize: vertical; min-height: 100px; line-height: 1.55; }
                .eg-hint { font-size: 11.5px; color: #94a3b8; }
                .eg-hint.ok { color: #16a34a; }

                .eg-prodi-sel {
                    border-color: #bfdbfe !important; background: #eff6ff !important;
                    color: #1d4ed8 !important; font-weight: 700 !important;
                }

                .eg-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .eg-sifat { display: flex; gap: 8px; }
                .eg-sifat select, .eg-sifat input { flex: 1; }

                .eg-cpmk-row { display: flex; gap: 8px; align-items: center; }
                .eg-cpmk-badge {
                    width: 72px; flex-shrink: 0; background: #f1f5f9; border: 1px solid #e2e8f0;
                    border-radius: 6px; padding: 7px 6px; font-size: 12px; font-weight: 700; color: #475569; text-align: center;
                }
                .eg-cpmk-row input {
                    flex: 1; border: 1px solid #e2e8f0; border-radius: 7px;
                    padding: 8px 11px; font-size: 13.5px; color: #0f172a;
                    background: #fff; outline: none; font-family: inherit;
                }

                .eg-btn-remove {
                    width: 28px; height: 28px; flex-shrink: 0;
                    border-radius: 6px; border: none; cursor: pointer;
                    background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s;
                }
                .eg-btn-remove:hover { background: #fee2e2; }
                .eg-btn-add {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 13px; font-weight: 600; color: #2563eb;
                    background: none; border: none; cursor: pointer; padding: 4px 0; font-family: inherit; transition: color 0.15s;
                }
                .eg-btn-add:hover { color: #1e40af; }

                .eg-soal-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
                .eg-soal-head {
                    padding: 12px 18px; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .eg-soal-label {
                    font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em;
                    display: flex; align-items: center; gap: 8px;
                }
                .eg-soal-num-badge {
                    background: #eff6ff; color: #1d4ed8; border-radius: 5px; padding: 2px 9px; font-size: 12px; font-weight: 700;
                }
                .eg-soal-body { padding: 18px; display: flex; flex-direction: column; gap: 16px; }

                .eg-row-g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
                .eg-row-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

                .eg-soal-body .eg-field input, .eg-soal-body .eg-field select, .eg-soal-body .eg-field textarea { font-size: 13.5px; }

                .eg-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
                .eg-chip {
                    display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 7px;
                    border: 1px solid #e2e8f0; background: #fff; cursor: pointer; font-size: 13px; font-weight: 600; color: #374151; transition: all 0.15s;
                }
                .eg-chip:hover { border-color: #93c5fd; background: #eff6ff; }
                .eg-chip.on { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
                .eg-chip input[type="checkbox"] { width: 15px; height: 15px; margin: 0; accent-color: #2563eb; cursor: pointer; flex-shrink: 0; }

                .eg-upload {
                    display: block; width: 100%; border: 1.5px dashed #cbd5e1; border-radius: 7px; padding: 10px 14px; font-size: 13px;
                    color: #64748b; background: #f8fafc; cursor: pointer; font-family: inherit; transition: all 0.15s;
                }
                .eg-upload:hover { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
                .eg-ok-badge {
                    display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: #16a34a;
                    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 5px; padding: 4px 10px; margin-top: 6px;
                }

                .eg-add-soal {
                    display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px;
                    border: 1.5px dashed #cbd5e1; border-radius: 12px; background: #fff; color: #2563eb; font-size: 14px; font-weight: 600;
                    font-family: inherit; cursor: pointer; transition: all 0.15s;
                }
                .eg-add-soal:hover { border-color: #2563eb; background: #eff6ff; }

                .eg-right-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
                .eg-right-header-icon {
                    width: 34px; height: 34px; border-radius: 9px; background: #2563eb;
                    display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;
                }
                .eg-right-header-icon svg { width: 17px; height: 17px; }
                .eg-right-header-title { font-size: 15px; font-weight: 700; color: #0f172a; }
                .eg-right-header-sub { font-size: 13px; color: #94a3b8; }

                /* ── SUBMIT BAR DENGAN 2 TOMBOL ── */
                .eg-submit-bar {
                    position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.96); backdrop-filter: blur(10px);
                    border-top: 1px solid #e2e8f0; padding: 14px 28px; 
                    display: flex; justify-content: flex-end; gap: 12px; z-index: 60;
                }
                
                .eg-reset-btn {
                    background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 9px; 
                    padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; 
                    display: flex; align-items: center; gap: 9px; transition: all 0.15s;
                }
                .eg-reset-btn:hover:not(:disabled) { background: #fee2e2; color: #dc2626; border-color: #f87171; }
                .eg-reset-btn:disabled { opacity: 0.55; cursor: not-allowed; }

                .eg-submit-btn {
                    background: #2563eb; color: #fff; border: none; border-radius: 9px; 
                    padding: 12px 32px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; 
                    display: flex; align-items: center; gap: 9px; transition: background 0.15s; min-width: 280px; justify-content: center;
                }
                .eg-submit-btn:hover:not(:disabled) { background: #1d4ed8; }
                .eg-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
                .eg-submit-btn svg { width: 17px; height: 17px; }
                
                @keyframes spin { to { transform: rotate(360deg); } }
                .eg-spin { animation: spin 0.9s linear infinite; }

                @media (max-width: 1024px) {
                    .eg-layout { grid-template-columns: 1fr; }
                    .eg-left { max-height: none; position: relative; top: 0; padding-bottom: 0; }
                    .eg-right { padding: 20px 18px 120px; }
                    .eg-row-g3 { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 640px) {
                    .eg-g2, .eg-row-g3, .eg-row-g2 { grid-template-columns: 1fr; }
                    .eg-submit-bar { flex-direction: column-reverse; padding: 12px 16px; gap: 8px; }
                    .eg-submit-btn, .eg-reset-btn { width: 100%; justify-content: center; min-width: unset; }
                }
            `,
				}}
			/>

			<datalist id="list-mk">
				{dbUjian.mataKuliah.map((mk, i) => (
					<option key={i} value={mk} />
				))}
			</datalist>
			<datalist id="list-dsn">
				{dbUjian.dosen.map((d, i) => (
					<option key={i} value={d} />
				))}
			</datalist>

			<div className="eg-root">
				{/* TOP BAR */}
				<div className="eg-topbar">
					<div className="eg-topbar-logo">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
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
					<div className="eg-layout">
						{/* PANEL KIRI */}
						<div className="eg-left">
							<div className="eg-panel">
								<div className="eg-panel-header">
									<div className="eg-panel-icon">
										<IconCalendar />
									</div>
									<span className="eg-panel-title">Identitas Ujian</span>
								</div>
								<div className="eg-panel-body">
									<div className="eg-field">
										<label>
											Program Studi <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<select
											required
											className="eg-prodi-sel"
											value={metadata.programStudi}
											onChange={(e) => setMetadata({ ...metadata, programStudi: e.target.value })}
											style={{
												borderRadius: "7px",
												padding: "8px 11px",
												fontSize: "13.5px",
												fontFamily: "inherit",
												outline: "none",
												fontWeight: 700,
												cursor: "pointer",
												border: "1px solid #bfdbfe",
												background: "#eff6ff",
												color: "#1d4ed8",
												width: "100%",
											}}
										>
											<option value="Teknik Elektro">Teknik Elektro</option>
											<option value="Teknik Industri">Teknik Industri</option>
											<option value="Teknik Biomedis">Teknik Biomedis</option>
										</select>
										<span className="eg-hint">Format tabel PDF menyesuaikan prodi.</span>
									</div>
									<div className="eg-field">
										<label>
											Mata Kuliah <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="text"
											required
											list="list-mk"
											placeholder="Cari nama mata kuliah..."
											value={metadata.mataKuliah}
											onChange={(e) => setMetadata({ ...metadata, mataKuliah: e.target.value.toUpperCase() })}
										/>
									</div>
									<div className="eg-g2">
										<div className="eg-field">
											<label>Kelompok</label>
											<input
												type="text"
												placeholder="E11.4401"
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
												<span className="eg-hint ok">{formatTanggalIndonesia(metadata.tanggalUjian)}</span>
											)}
										</div>
									</div>

									<div className="eg-field">
										<label>Dosen Pengampu</label>
										<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
											{metadata.dosenPengampu.map((dsn, idx) => (
												<div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
													<input
														type="text"
														list="list-dsn"
														required
														placeholder="Cari nama dosen..."
														value={dsn}
														onChange={(e) => handleChangeDosen(idx, e.target.value)}
														style={{ flex: 1 }}
													/>
													{metadata.dosenPengampu.length > 1 && (
														<button type="button" className="eg-btn-remove" onClick={() => handleRemoveDosen(idx)}>
															<IconX />
														</button>
													)}
												</div>
											))}
										</div>
										<button
											type="button"
											className="eg-btn-add"
											onClick={handleAddDosen}
											style={{ marginTop: "4px", alignSelf: "flex-start" }}
										>
											<IconPlus /> Tambah Dosen
										</button>
									</div>

									<div className="eg-field">
										<label>
											Waktu Ujian <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<select
											required
											value={metadata.waktu}
											onChange={(e) => setMetadata({ ...metadata, waktu: e.target.value })}
										>
											<optgroup label="Sesi 1 (08:00)">
												<option value="08:00 - 08:30 (30 Menit)">08:00 - 08:30 (30 Menit)</option>
												<option value="08:00 - 09:00 (60 Menit)">08:00 - 09:00 (60 Menit)</option>
												<option value="08:00 - 09:30 (90 Menit)">08:00 - 09:30 (90 Menit)</option>
												<option value="08:00 - 09:40 (100 Menit)">08:00 - 09:40 (100 Menit)</option>
											</optgroup>
											<optgroup label="Sesi 2 (09:45)">
												<option value="09:45 - 10:15 (30 Menit)">09:45 - 10:15 (30 Menit)</option>
												<option value="09:45 - 10:45 (60 Menit)">09:45 - 10:45 (60 Menit)</option>
												<option value="09:45 - 11:15 (90 Menit)">09:45 - 11:15 (90 Menit)</option>
												<option value="09:45 - 11:25 (100 Menit)">09:45 - 11:25 (100 Menit)</option>
												<option value="09:45 - 11:45 (120 Menit)">09:45 - 11:45 (120 Menit)</option>
											</optgroup>
											<optgroup label="Sesi 3 (13:00)">
												<option value="13:00 - 13:30 (30 Menit)">13:00 - 13:30 (30 Menit)</option>
												<option value="13:00 - 14:00 (60 Menit)">13:00 - 14:00 (60 Menit)</option>
												<option value="13:00 - 14:30 (90 Menit)">13:00 - 14:30 (90 Menit)</option>
												<option value="13:00 - 14:40 (100 Menit)">13:00 - 14:40 (100 Menit)</option>
												<option value="13:00 - 15:00 (120 Menit)">13:00 - 15:00 (120 Menit)</option>
											</optgroup>
											<optgroup label="Sesi 3 (13:00) Jumat">
												<option value="13:15 - 13:45 (30 Menit)">13:15 - 13:45 (30 Menit)</option>
												<option value="13:15 - 14:15 (60 Menit)">13:15 - 14:15 (60 Menit)</option>
												<option value="13:15 - 14:45 (90 Menit)">13:15 - 14:45 (90 Menit)</option>
												<option value="13:15 - 14:55 (100 Menit)">13:15 - 14:55 (100 Menit)</option>
												<option value="13:15 - 15:15 (120 Menit)">13:15 - 15:15 (120 Menit)</option>
											</optgroup>
										</select>
									</div>
									<div className="eg-field">
										<label>
											Sifat Ujian <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<div className="eg-sifat">
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
												placeholder="Catatan tambahan..."
												value={metadata.sifatCatatan}
												onChange={(e) => setMetadata({ ...metadata, sifatCatatan: e.target.value })}
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="eg-panel">
								<div className="eg-panel-header">
									<div className="eg-panel-icon">
										<IconCheck />
									</div>
									<span className="eg-panel-title">Daftar CPMK</span>
								</div>
								<div className="eg-panel-body">
									{cpmkList.map((cpmk, i) => (
										<div key={i} className="eg-cpmk-row">
											<div className="eg-cpmk-badge">{cpmk.id}</div>
											<input
												type="text"
												required
												placeholder="Deskripsi capaian..."
												value={cpmk.deskripsi}
												onChange={(e) => {
													const u = [...cpmkList];
													u[i].deskripsi = e.target.value;
													setCpmkList(u);
												}}
											/>
											{cpmkList.length > 1 && (
												<button type="button" className="eg-btn-remove" onClick={() => handleRemoveCpmk(i)}>
													<IconX />
												</button>
											)}
										</div>
									))}
									<button type="button" className="eg-btn-add" onClick={handleAddCpmk}>
										<IconPlus /> Tambah CPMK
									</button>
								</div>
							</div>

							<div className="eg-panel" style={{ borderBottom: "none" }}>
								<div className="eg-panel-header">
									<div className="eg-panel-icon">
										<IconShield />
									</div>
									<span className="eg-panel-title">Pengesahan</span>
								</div>
								<div className="eg-panel-body">
									<div className="eg-field">
										<label>
											Nama Koordinator MK <span style={{ color: "#ef4444" }}>*</span>
										</label>
										<input
											type="text"
											required
											list="list-dsn"
											placeholder="Cari nama koordinator..."
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
											Tanggal Koordinator <span style={{ color: "#ef4444" }}>*</span>
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

						{/* PANEL KANAN */}
						<div className="eg-right">
							<div className="eg-right-header">
								<div className="eg-right-header-icon">
									<IconEdit />
								</div>
								<div>
									<div className="eg-right-header-title">Lembar Kerja: Daftar Soal &amp; Mapping</div>
									<div className="eg-right-header-sub">Isi pertanyaan, mapping CPMK, bobot, dan letak gambar</div>
								</div>
							</div>

							{soalList.map((soal, index) => (
								<div key={index} className="eg-soal-card">
									<div className="eg-soal-head">
										<span className="eg-soal-label">
											<span className="eg-soal-num-badge">#{soal.nomorSoal}</span>
											Soal {soal.nomorSoal}
										</span>
										{soalList.length > 1 && (
											<button
												type="button"
												className="eg-btn-remove"
												onClick={() => handleRemoveSoal(index)}
												title="Hapus soal"
											>
												<IconX />
											</button>
										)}
									</div>

									<div className="eg-soal-body">
										<div className={isElektro ? "eg-row-g3" : "eg-row-g2"}>
											<div className="eg-field">
												<label>Bentuk Soal</label>
												<select
													required
													value={soal.bentukSoal}
													onChange={(e) => {
														const u = [...soalList];
														u[index].bentukSoal = e.target.value;
														setSoalList(u);
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
															const u = [...soalList];
															u[index].pemetaanCpmk.subCpmk = e.target.value;
															setSoalList(u);
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
														const u = [...soalList];
														u[index].bobotPersen = Number(e.target.value);
														setSoalList(u);
													}}
												/>
												<label
													style={{
														display: "flex",
														alignItems: "center",
														gap: "6px",
														marginTop: "8px",
														cursor: "pointer",
														textTransform: "none",
														fontWeight: 500,
														fontSize: "12px",
														color: "#64748b",
													}}
												>
													<input
														type="checkbox"
														checked={soal.tampilBobot}
														onChange={(e) => {
															const u = [...soalList];
															u[index].tampilBobot = e.target.checked;
															setSoalList(u);
														}}
														style={{ width: "14px", height: "14px", margin: 0, cursor: "pointer" }}
													/>
													Tampilkan Bobot di PDF
												</label>
											</div>
										</div>

										<div className="eg-field">
											<label>
												Kaitan CPMK{" "}
												<span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8", fontSize: "11px" }}>
													— Bisa lebih dari satu
												</span>
											</label>
											<div className="eg-chips">
												{cpmkList.map((c, i) => {
													const val = c.id.replace("CPMK ", "");
													const checked = isElektro
														? soal.pemetaanCpmk.cpmk
															? soal.pemetaanCpmk.cpmk.split(", ").includes(val)
															: false
														: soal.pemetaanCpmkIndustri.includes(c.id);
													return (
														<label key={i} className={`eg-chip${checked ? " on" : ""}`}>
															<input
																type="checkbox"
																checked={checked}
																onChange={(e) => {
																	const u = [...soalList];
																	if (isElektro) {
																		let arr = u[index].pemetaanCpmk.cpmk ? u[index].pemetaanCpmk.cpmk.split(", ") : [];
																		if (e.target.checked) {
																			if (!arr.includes(val)) arr.push(val);
																		} else {
																			arr = arr.filter((v) => v !== val);
																		}
																		arr.sort((a, b) => parseInt(a) - parseInt(b));
																		u[index].pemetaanCpmk.cpmk = arr.join(", ");
																	} else {
																		if (e.target.checked) u[index].pemetaanCpmkIndustri.push(c.id);
																		else
																			u[index].pemetaanCpmkIndustri = u[index].pemetaanCpmkIndustri.filter(
																				(id) => id !== c.id,
																			);
																	}
																	setSoalList(u);
																}}
															/>
															{c.id}
														</label>
													);
												})}
											</div>
										</div>

										<div className="eg-row-g2">
											<div className="eg-field">
												<label>Uraian Materi</label>
												<input
													type="text"
													required
													placeholder="Contoh: Analisis Kestabilan Sistem"
													value={soal.uraianMateri}
													onChange={(e) => {
														const u = [...soalList];
														u[index].uraianMateri = e.target.value;
														setSoalList(u);
													}}
												/>
											</div>
											<div className="eg-field">
												<label>
													Gambar Pendukung{" "}
													<span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8", fontSize: "11px" }}>
														— Opsional
													</span>
												</label>
												<input
													type="file"
													accept="image/*"
													className="eg-upload"
													onChange={(e) => handleImageUpload(e, index)}
												/>
												{soal.kontenSoal.gambarPendukung.length > 0 && (
													<span className="eg-ok-badge">
														<svg
															viewBox="0 0 24 24"
															width="12"
															height="12"
															fill="none"
															stroke="#16a34a"
															strokeWidth="2.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<polyline points="20 6 9 17 4 12" />
														</svg>
														Gambar terlampir
													</span>
												)}
											</div>
										</div>

										<div className="eg-field">
											<label>Teks Pertanyaan / Soal Utama</label>
											<textarea
												required
												placeholder="Gunakan $$ untuk rumus LaTeX, contoh: $$x = \frac{1}{2}$$"
												value={soal.kontenSoal.teksPertanyaan}
												onChange={(e) => {
													const u = [...soalList];
													u[index].kontenSoal.teksPertanyaan = e.target.value;
													setSoalList(u);
												}}
											/>
										</div>

										<div className="eg-field">
											<label>
												Posisi Gambar{" "}
												<span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8", fontSize: "11px" }}>
													— Bila ada gambar
												</span>
											</label>
											<select
												value={soal.posisiGambar || "Atas"}
												onChange={(e) => {
													const u = [...soalList];
													u[index].posisiGambar = e.target.value;
													setSoalList(u);
												}}
											>
												<option value="Atas">Di Awal Pertanyaan (Atas)</option>
												<option value="Bawah">Di Akhir Pertanyaan (Bawah)</option>
												<option value="Kustom">Di Tengah Teks (Kustom)</option>
											</select>
											{soal.posisiGambar === "Kustom" && (
												<span className="eg-hint" style={{ color: "#2563eb", fontWeight: 600 }}>
													Ketik tag [GAMBAR] di dalam teks pertanyaan di atas.
												</span>
											)}
										</div>
									</div>
								</div>
							))}

							<button type="button" className="eg-add-soal" onClick={handleAddSoal}>
								<IconPlus /> Tambah Lembar Soal Baru
							</button>
						</div>
					</div>

					<div className="eg-submit-bar">
						<button type="button" onClick={handleResetForm} disabled={isGenerating} className="eg-reset-btn">
							<IconTrash /> Reset Form
						</button>
						<button type="submit" disabled={isGenerating} className="eg-submit-btn">
							{isGenerating ? (
								<>
									<svg
										className="eg-spin"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
									>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Mencetak PDF...
								</>
							) : (
								<>
									<IconDownload /> Generate File PDF Sekarang
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
