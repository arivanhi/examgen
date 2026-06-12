// templates/assesmentTemplates.ts

export function htmlTemplateAssessment(data: any): string {
	const dosenArray = Array.isArray(data.metadata.dosenPengampu)
		? data.metadata.dosenPengampu
		: [data.metadata.dosenPengampu];
	const dosen = dosenArray.filter((d: string) => d && d.trim() !== "").join(", ") || "-";
	const logoSrc = data.logoBase64 || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
	const isElektro = data.metadata.programStudi === "Teknik Elektro";

	const teksJenisUjian = data.metadata.jenisUjian === "UTS" ? "UJIAN TENGAH SEMESTER" : "UJIAN AKHIR SEMESTER";
	const teksSemester = data.metadata.semester === "GANJIL" ? "GANJIL" : "GENAP";
	const teksTahun = data.metadata.tahunAjar || "2025/2026";

	// ─── LOGIKA BARU: PENGELOMPOKAN SOAL (GROUPING) ───
	const groupedSoal: any[] = [];
	data.soalList.forEach((soal: any) => {
		const keyMateri = (soal.uraianMateri || "").trim().toLowerCase();
		const keyBentuk = (soal.bentukSoal || "").trim().toLowerCase();

		// Cari apakah sudah ada baris dengan Materi & Bentuk Soal yang sama persis
		const existing = groupedSoal.find(
			(g) =>
				(g.uraianMateri || "").trim().toLowerCase() === keyMateri &&
				(g.bentukSoal || "").trim().toLowerCase() === keyBentuk,
		);

		if (existing) {
			existing.soalNumbers.push(Number(soal.nomorSoal));
			existing.totalBobot += Number(soal.bobotPersen) || 0;

			// Gabungkan relasi CPMK Industri
			if (soal.pemetaanCpmkIndustri) {
				soal.pemetaanCpmkIndustri.forEach((c: string) => {
					if (!existing.pemetaanCpmkIndustri.includes(c)) existing.pemetaanCpmkIndustri.push(c);
				});
			}

			// Gabungkan relasi CPMK Elektro
			if (soal.pemetaanCpmk?.cpmk) {
				const arr = soal.pemetaanCpmk.cpmk
					.split(",")
					.map((s: string) => s.trim())
					.filter(Boolean);
				const exArr = existing.pemetaanCpmk.cpmk
					? existing.pemetaanCpmk.cpmk
							.split(",")
							.map((s: string) => s.trim())
							.filter(Boolean)
					: [];
				arr.forEach((c: string) => {
					if (!exArr.includes(c)) exArr.push(c);
				});
				existing.pemetaanCpmk.cpmk = exArr.sort((a: string, b: string) => parseInt(a) - parseInt(b)).join(", ");
			}
			if (soal.pemetaanCpmk?.subCpmk) {
				const arr = soal.pemetaanCpmk.subCpmk
					.split(",")
					.map((s: string) => s.trim())
					.filter(Boolean);
				const exArr = existing.pemetaanCpmk.subCpmk
					? existing.pemetaanCpmk.subCpmk
							.split(",")
							.map((s: string) => s.trim())
							.filter(Boolean)
					: [];
				arr.forEach((c: string) => {
					if (!exArr.includes(c)) exArr.push(c);
				});
				existing.pemetaanCpmk.subCpmk = exArr.sort((a: string, b: string) => parseInt(a) - parseInt(b)).join(", ");
			}
		} else {
			groupedSoal.push({
				uraianMateri: soal.uraianMateri,
				bentukSoal: soal.bentukSoal,
				soalNumbers: [Number(soal.nomorSoal)],
				totalBobot: Number(soal.bobotPersen) || 0,
				pemetaanCpmkIndustri: soal.pemetaanCpmkIndustri ? [...soal.pemetaanCpmkIndustri] : [],
				pemetaanCpmk: soal.pemetaanCpmk ? { ...soal.pemetaanCpmk } : { subCpmk: "", cpmk: "" },
			});
		}
	});

	// Helper cerdas pembuat rentang nomor (Contoh: [1,2,3] -> "1 - 3", [1,3] -> "1, 3")
	const formatNumbers = (nums: number[]) => {
		if (!nums || !nums.length) return "";
		const sorted = [...new Set(nums)].sort((a, b) => a - b);
		let ranges = [];
		let start = sorted[0];
		let end = sorted[0];

		for (let i = 1; i < sorted.length; i++) {
			if (sorted[i] === end + 1) {
				end = sorted[i];
			} else {
				ranges.push(start === end ? `${start}` : `${start} - ${end}`);
				start = sorted[i];
				end = sorted[i];
			}
		}
		ranges.push(start === end ? `${start}` : `${start} - ${end}`);
		return ranges.join(", ");
	};
	// ──────────────────────────────────────────────────

	const tabelMappingHtml = isElektro
		? `
  <p class="tabel-label"><strong>Tabel 2. Mapping Soal – CPMK – Sub CPMK:</strong></p>
  <table class="table-bordered" style="font-size:9pt;">
    <thead>
      <tr>
        <th style="width:5%; text-align:center;">No.</th>
        <th style="width:15%; text-align:center;">Bentuk Soal</th>
        <th colspan="2" style="width:30%; text-align:center;">URAIAN MATERI</th>
        <th style="width:35%; text-align:center;">CPMK dan SCPMK</th>
        <th style="width:15%; text-align:center;">BOBOT SOAL (%)</th>
      </tr>
    </thead>
    <tbody>
      ${groupedSoal
				.map(
					(g: any, index: number) => `
        <tr>
          <td style="text-align:center;">${index + 1}.</td>
          <td style="text-align:center;">${g.bentukSoal}</td>
          <td style="white-space: pre-wrap;">${g.uraianMateri || "-"}</td>
          <td style="text-align:center; white-space:nowrap;">Soal No.<br/>${formatNumbers(g.soalNumbers)}</td>
          <td style="padding:0;">
            <table style="width:100%; height:100%; border-collapse:collapse; border:none; margin:0;">
              <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:5px 8px; width:45%;"><strong>CPMK:</strong></td><td style="border-bottom:1px solid #000; padding:5px 8px; text-align:center;"><strong>${g.pemetaanCpmk?.cpmk || "-"}</strong></td></tr>
              <tr><td style="border-right:1px solid #000; padding:5px 8px;"><strong>SCPMK:</strong></td><td style="padding:5px 8px; text-align:center;"><strong>${g.pemetaanCpmk?.subCpmk || "-"}</strong></td></tr>
            </table>
          </td>
          <td style="text-align:center;"><strong>${g.totalBobot}</strong></td>
        </tr>
      `,
				)
				.join("")}
    </tbody>
  </table>
  `
		: `
  <p class="tabel-label"><strong>Tabel 2. Mapping Soal :</strong></p>
  <table class="table-bordered" style="font-size:9pt;">
    <thead>
      <tr>
        <th rowspan="2" style="width:5%; text-align:center;">No.</th>
        <th rowspan="2" style="width:15%; text-align:center;">Bentuk Soal</th>
        <th colspan="2" rowspan="2" style="width:30%; text-align:center;">Uraian Materi</th>
        <th colspan="${data.cpmkList.length}" style="text-align:center;">Ada hubungan Dengan CPMK (beri tanda &#10003;)</th>
        <th rowspan="2" style="width:10%; text-align:center;">BOBOT SOAL (%)</th>
      </tr>
      <tr>${data.cpmkList.map((c: any) => `<th style="text-align:center; width:${40 / data.cpmkList.length}%;">CPMK<br/>${c.id.replace("CPMK ", "")}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${groupedSoal
				.map(
					(g: any, index: number) => `
        <tr>
          <td style="text-align:center;">${index + 1}.</td>
          <td style="text-align:center;">${g.bentukSoal}</td>
          <td style="white-space: pre-wrap;">${g.uraianMateri || "-"}</td>
          <td style="text-align:center; white-space:nowrap;">Soal No.<br/>${formatNumbers(g.soalNumbers)}</td>
          ${data.cpmkList.map((c: any) => `<td style="text-align:center; font-size:12pt; font-weight:bold;">${g.pemetaanCpmkIndustri && g.pemetaanCpmkIndustri.includes(c.id) ? "&#10003;" : ""}</td>`).join("")}
          <td style="text-align:center;"><strong>${g.totalBobot}</strong></td>
        </tr>
      `,
				)
				.join("")}
    </tbody>
  </table>
  `;

	return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <script>
    window.MathJax = { tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']] }, svg: { fontCache: 'global' } };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
  <style>
    @page { size: 215mm 330mm; margin: 15mm 20mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 0; padding: 0; position: relative; }
    .paraf-fixed { position: fixed; bottom: 0; right: 0; width: 225px; z-index: 100; background: white; }
    .paraf-table { border-collapse: collapse; width: 100%; font-size: 9pt; }
    .paraf-table td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; line-height: 1.3; }
    .paraf-table .label-col { border-right: none; width: 45%; }
    .paraf-table .sign-col { border-left: none; text-align: left; width: 55%; }
    .doc-header { width: 100%; border-bottom: 3px double #000; border-collapse: collapse; margin-bottom: 15px; padding-bottom: 5px; }
    .doc-header td { vertical-align: middle; }
    .logo { width: 80px; height: auto; }
    .header-fak  { font-size: 16pt; font-weight: bold; line-height: 1; margin: 0; }
    .header-univ { font-size: 14pt; font-weight: bold; line-height: 1.2; margin: 2px 0 0 0; }
    .header-addr { font-size: 10pt; margin: 3px 0 0 0; }
    .exam-title { text-align: center; font-weight: bold; margin-bottom: 15px; font-size: 12pt; line-height: 1.3; text-transform: uppercase; }
    .meta-table { width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 10pt; margin-bottom: 15px; }
    .meta-table td { padding: 3px 8px; vertical-align: top; line-height: 1.1; }
    .meta-divider { border-left: 1px solid #000; }
    .table-bordered { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11pt; }
    .table-bordered th, .table-bordered td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }
    h4 { font-size: 11pt; margin: 10px 0 5px 0; font-weight: bold; }
    p.tabel-label { margin: 0 0 5px 0; font-size: 11pt; }
  </style>
</head>
<body>
  <div class="paraf-fixed"><table class="paraf-table"><tr><td class="label-col" style="border-bottom: 1px solid #000;">Paraf<br/>Koordinator MK</td><td class="sign-col" style="border-bottom: 1px solid #000;">:</td></tr><tr><td class="label-col">Paraf<br/>Kaprogdi</td><td class="sign-col">:</td></tr></table></div>
  <table class="doc-header"><tr><td style="width:15%; text-align:center;"><img src="${logoSrc}" class="logo" alt="Logo UDINUS" /></td><td style="width:55%;"><p class="header-fak">FAKULTAS TEKNIK</p><p class="header-univ">UNIVERSITAS DIAN NUSWANTORO</p><p class="header-addr">Jl. Nakula I No.1 Gedung I. Telp. (024) 3555628 Semarang 50131</p></td><td style="width:30%; text-align:right; font-size:9pt; vertical-align:top;">FM-UDINUS-BM-04-15/R1</td></tr></table>
  
  <div class="exam-title">
    ${teksJenisUjian} ${teksSemester} T.A. ${teksTahun}<br/>
    L E M B A R &nbsp; S O A L
  </div>

  <table class="meta-table"><tr><td style="width:18%;">Mata Kuliah</td><td style="width:2%;">:</td><td style="width:30%;">${data.metadata.mataKuliah}</td><td style="width:15%;" class="meta-divider">Waktu</td><td style="width:2%;">:</td><td style="width:33%;">${data.metadata.waktu}</td></tr><tr><td>Hari / Tanggal</td><td>:</td><td>${data.metadata.hariTanggal}</td><td class="meta-divider">Sifat</td><td>:</td><td>${data.metadata.sifat}</td></tr><tr><td>Kelompok</td><td>:</td><td>${data.metadata.kelompok}</td><td class="meta-divider">Dosen</td><td>:</td><td>${dosen}</td></tr></table>
  <h4>Rancangan Assesment</h4><p class="tabel-label"><strong>Tabel 1. Capaian Pembelajaran Mata Kuliah (CPMK) ${data.metadata.mataKuliah} adalah sebagai berikut:</strong></p>
  
  <table class="table-bordered">
    ${data.cpmkList
			.map((c: any) => {
				let rows = `<tr><td style="width:15%; text-align:center;"><strong>${c.id}</strong></td><td>${c.deskripsi}</td></tr>`;
				if (c.subCpmks && c.subCpmks.length > 0) {
					rows += `<tr><td colspan="2"><strong>Sub CPMK :</strong></td></tr>`;
					rows += c.subCpmks
						.map(
							(sub: any) =>
								`<tr><td style="width:15%; text-align:center;"><strong>${sub.id}</strong></td><td>${sub.deskripsi}</td></tr>`,
						)
						.join("");
				}
				return rows;
			})
			.join("")}
  </table>

  ${tabelMappingHtml}
</body>
</html>`;
}
