// templates/questionsTemplates.ts

export function htmlTemplateQuestions(data: any): string {
	const dosenArray = Array.isArray(data.metadata.dosenPengampu)
		? data.metadata.dosenPengampu
		: [data.metadata.dosenPengampu];
	const dosen = dosenArray.filter((d: string) => d && d.trim() !== "").join(", ") || "-";
	const logoSrc = data.logoBase64 || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

	// PEMBACAAN KODE SINGKAT YANG ANTI-GAGAL
	const teksJenisUjian = data.metadata.jenisUjian === "UTS" ? "UJIAN TENGAH SEMESTER" : "UJIAN AKHIR SEMESTER";
	const teksSemester = data.metadata.semester === "GANJIL" ? "GANJIL" : "GENAP";
	const teksTahun = data.metadata.tahunAjar || "2025/2026";

	return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <script>
    window.MathJax = { tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']] }, svg: { fontCache: 'global' } };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 0; padding: 0; }
    .main-layout { width: 100%; border-collapse: collapse; }
    .doc-header { width: 100%; border-bottom: 3px double #000; border-collapse: collapse; margin-bottom: 15px; padding-bottom: 5px; }
    .doc-header td { vertical-align: middle; padding: 0; }
    .logo { width: 75px; height: auto; }
    .header-fak  { font-size: 16pt; font-weight: bold; line-height: 1; margin: 0; }
    .header-univ { font-size: 14pt; font-weight: bold; line-height: 1.2; margin: 2px 0 0 0; }
    .header-addr { font-size: 10pt; margin: 3px 0 0 0; }
    .exam-title { text-align: center; font-weight: bold; margin-bottom: 15px; font-size: 12pt; line-height: 1.3; text-transform: uppercase; }
    .meta-table { width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 10pt; margin-bottom: 15px; }
    .meta-table td { padding: 3px 8px; vertical-align: top; line-height: 1.1; }
    .meta-divider { border-left: 1px solid #000; }
    .instruksi { font-weight: bold; text-decoration: underline; margin: 10px 0 15px 0; font-size: 11pt; }
    .soal-item { margin-bottom: 20px; page-break-inside: avoid; }
    .layout-tabel { width: 100%; border-collapse: collapse; table-layout: fixed; border: none; }
    .layout-tabel td { border: none; padding: 0; }
    .soal-num { width: 25px; vertical-align: top; padding-top: 0; margin: 0; }
    .soal-body { vertical-align: top; text-align: justify; word-break: break-word; overflow-wrap: break-word; padding-top: 0; margin: 0; }
    .teks-soal { white-space: pre-wrap; margin: 0 0 8px 0; padding: 0; }
    .img-container { margin: 0 0 8px 0; text-align: center; }
    .uploaded-img { max-width: 45%; max-height: 250px; object-fit: contain; display: block; margin: 0 auto; }
  </style>
</head>
<body>
  <table class="main-layout">
    <thead>
      <tr>
        <th style="font-weight: normal; text-align: left; padding-bottom: 5px;">
          <table class="doc-header">
            <tr>
              <td style="width:15%; text-align:center;"><img src="${logoSrc}" class="logo" alt="Logo UDINUS" /></td>
              <td style="width:55%;"><p class="header-fak">FAKULTAS TEKNIK</p><p class="header-univ">UNIVERSITAS DIAN NUSWANTORO</p><p class="header-addr">Jl. Nakula I No.1 Gedung I. Telp. (024) 3555628 Semarang 50131</p></td>
              <td style="width:30%; text-align:right; font-size:9pt; vertical-align:top;">FM-UDINUS-BM-04-15/R1</td>
            </tr>
          </table>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="exam-title">
            ${teksJenisUjian} ${teksSemester} T.A. ${teksTahun}<br/>
            L E M B A R &nbsp; S O A L
          </div>
          <table class="meta-table"><tr><td style="width:18%;">Mata Kuliah</td><td style="width:2%;">:</td><td style="width:30%;">${data.metadata.mataKuliah}</td><td style="width:15%;" class="meta-divider">Waktu</td><td style="width:2%;">:</td><td style="width:33%;">${data.metadata.waktu}</td></tr><tr><td>Hari / Tanggal</td><td>:</td><td>${data.metadata.hariTanggal}</td><td class="meta-divider">Sifat</td><td>:</td><td>${data.metadata.sifat}</td></tr><tr><td>Kelompok</td><td>:</td><td>${data.metadata.kelompok}</td><td class="meta-divider">Dosen</td><td>:</td><td>${dosen}</td></tr></table>
        </td>
      </tr>
      ${data.soalList
				.map((soal: any) => {
					const imgs = soal.kontenSoal.gambarPendukung || [];
					const hasImg = imgs.length > 0;
					const imgHtml = hasImg
						? imgs
								.map((img: string) => `<img src="${img}" class="uploaded-img" alt="Gambar soal ${soal.nomorSoal}" />`)
								.join("")
						: "";
					let teks = (soal.kontenSoal.teksPertanyaan || "").trim();
					let finalBody = "";

					if (soal.posisiGambar === "Kustom" && teks.includes("[GAMBAR]")) {
						const imgBlock = hasImg ? `<div class="img-container">${imgHtml}</div>` : "";
						teks = teks.replace("[GAMBAR]", imgBlock);
						finalBody = `<div class="teks-soal">${teks}</div>`;
					} else if (soal.posisiGambar === "Bawah") {
						finalBody = `<div class="teks-soal">${teks}</div>`;
						if (hasImg) finalBody += `<div class="img-container">${imgHtml}</div>`;
					} else {
						if (hasImg) finalBody += `<div class="img-container">${imgHtml}</div>`;
						finalBody += `<div class="teks-soal">${teks}</div>`;
					}

					if (soal.tampilBobot) {
						finalBody += `<div style="text-align: right; font-style: italic; font-size: 10.5pt; color: #000; margin-top: 5px;">(Bobot: ${soal.bobotPersen}%)</div>`;
					}
					return `<tr><td><div class="soal-item"><table class="layout-tabel"><tr><td class="soal-num">${soal.nomorSoal}.</td><td class="soal-body">${finalBody}</td></tr></table></div></td></tr>`;
				})
				.join("")}
    </tbody>
  </table>
</body>
</html>`;
}

export function htmlPengesahanStamp(data: any): string {
	return `<!DOCTYPE html><html lang="id"><head><style>* { box-sizing: border-box; } body { font-family: 'Times New Roman', Times, serif; font-size: 9.5pt; margin: 0; padding: 2px; } .pengesahan-table { width: 100%; border-collapse: collapse; table-layout: fixed; } .pengesahan-table td { border: 1px solid #000; padding: 0; vertical-align: top; } .inner-pen { width: 100%; border-collapse: collapse; } .inner-pen td { padding: 4px 8px; vertical-align: top; border: none; font-size: 9.5pt; } .sign-row { height: 70px; vertical-align: top; }</style></head><body><table class="pengesahan-table"><tr><td width="50%"><table class="inner-pen"><tr><td width="30%">Diperiksa oleh</td><td width="5%">:</td><td>Koordinator Mata Kuliah</td></tr><tr><td>Nama</td><td>:</td><td>${data.pengesahan.koordinatorMk.nama}</td></tr><tr><td>Tanggal</td><td>:</td><td>${data.pengesahan.koordinatorMk.tanggal}</td></tr><tr><td class="sign-row">Tanda tangan</td><td>:</td><td></td></tr></table></td><td width="50%"><table class="inner-pen"><tr><td width="30%">Disahkan oleh</td><td width="5%">:</td><td>Kaprogdi ${data.metadata.programStudi}</td></tr><tr><td>Nama</td><td>:</td><td>${data.pengesahan.kaprogdi.nama}</td></tr><tr><td>Tanggal</td><td>:</td><td>${data.pengesahan.kaprogdi.tanggal}</td></tr><tr><td class="sign-row">Tanda tangan</td><td>:</td><td></td></tr></table></td></tr></table></body></html>`;
}

export function htmlParafStamp(): string {
	return `<!DOCTYPE html><html lang="id"><head><style>.paraf-fixed { position: fixed; bottom: 0; right: 0; width: 225px; z-index: 100; background: white; } .paraf-table { border-collapse: collapse; width: 100%; font-size: 9pt; } .paraf-table td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; line-height: 1.3; } .paraf-table .label-col { border-right: none; width: 45%; } .paraf-table .sign-col { border-left: none; text-align: left; width: 55%; }</style></head><body><div class="paraf-fixed"><table class="paraf-table"><tr><td class="label-col" style="border-bottom: 1px solid #000;">Paraf<br/>Koordinator MK</td><td class="sign-col" style="border-bottom: 1px solid #000;">:</td></tr><tr><td class="label-col">Paraf<br/>Kaprogdi</td><td class="sign-col">:</td></tr></table></div></body></html>`;
}
