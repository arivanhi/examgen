// templates/assesmentTemplates.ts
// Menghasilkan HTML untuk PDF Halaman 1 (Assessment):
// Header universitas, identitas ujian, Tabel CPMK, Tabel Mapping, footer paraf kecil

export function htmlTemplateAssessment(data: any): string {
	const dosen = Array.isArray(data.metadata.dosenPengampu)
		? data.metadata.dosenPengampu.join(", ")
		: data.metadata.dosenPengampu;

	// Deteksi logoBase64 hasil inject dari route.ts
	const logoSrc = data.logoBase64 || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

	return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: 215mm 330mm; /* Kertas F4 */
      margin: 15mm 20mm; /* Margin standar: Atas 15mm, Kanan-Kiri-Bawah 20mm */
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
      position: relative;
    }

    /* ─── Footer Paraf (pojok kanan bawah, muncul di setiap halaman) ─── */
    .paraf-fixed {
      position: fixed;
      bottom: 0; /* Menempel pada batas margin bawah */
      right: 0;  /* Menempel pada batas margin kanan */
      width: 225px; /* Diperlebar agar teks tidak menyempit */
      z-index: 100;
      background: white;
    }
    .paraf-table { border-collapse: collapse; width: 100%; font-size: 9pt; }
    .paraf-table td {
      border: 1px solid #000;
      padding: 6px 8px;
      vertical-align: middle;
      line-height: 1.3;
    }
    .paraf-table .label-col { border-right: none; width: 45%; }
    .paraf-table .sign-col { border-left: none; text-align: left; width: 55%; }

    /* ─── Header Universitas ─── */
    .doc-header { 
      width: 100%; 
      border-bottom: 3px double #000; /* Garis ganda di bawah header, bukan box */
      border-collapse: collapse; 
      margin-bottom: 15px; 
      padding-bottom: 5px; 
    }
    .doc-header td { vertical-align: middle; }
    .logo { width: 80px; height: auto; }
    .header-fak  { font-size: 16pt; font-weight: bold; line-height: 1; margin: 0; }
    .header-univ { font-size: 14pt; font-weight: bold; line-height: 1.2; margin: 2px 0 0 0; }
    .header-addr { font-size: 10pt; margin: 3px 0 0 0; }

    /* ─── Judul Ujian ─── */
    .exam-title {
      text-align: center;
      font-weight: bold;
      margin-bottom: 15px;
      font-size: 12pt;
      line-height: 1.3;
    }

    /* ─── Tabel Identitas ─── */
    .meta-table {
      width: 100%;
      border: 1px solid #000;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 15px;
    }
    .meta-table td { padding: 4px 8px; vertical-align: top; }
    .meta-divider { border-left: 1px solid #000; }

    /* ─── Tabel Konten ─── */
    .table-bordered { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11pt; }
    .table-bordered th,
    .table-bordered td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }

    h4 { font-size: 11pt; margin: 10px 0 5px 0; font-weight: bold; }
    p.tabel-label { margin: 0 0 5px 0; font-size: 11pt; }
  </style>
</head>
<body>

  <div class="paraf-fixed">
    <table class="paraf-table">
      <tr>
        <td class="label-col" style="border-bottom: 1px solid #000;">Paraf<br/>Koordinator MK</td>
        <td class="sign-col" style="border-bottom: 1px solid #000;">:</td>
      </tr>
      <tr>
        <td class="label-col">Paraf<br/>Kaprogdi</td>
        <td class="sign-col">:</td>
      </tr>
    </table>
  </div>

  <table class="doc-header">
    <tr>
      <td style="width:15%; text-align:center;">
        <img
          src="${logoSrc}"
          class="logo"
          alt="Logo UDINUS"
        />
      </td>
      <td style="width:65%;">
        <p class="header-fak">FAKULTAS TEKNIK</p>
        <p class="header-univ">UNIVERSITAS DIAN NUSWANTORO</p>
        <p class="header-addr">Jl. Nakula I No.1 Gedung I. Telp. (024) 3555628 Semarang 50131</p>
      </td>
      <td style="width:20%; text-align:right; font-size:9pt; vertical-align:top;">
        FM-UDINUS-BM-04-15/R1
      </td>
    </tr>
  </table>

  <div class="exam-title">
    UJIAN AKHIR SEMESTER GENAP T.A. 2025/2026<br/>
    L E M B A R &nbsp; S O A L
  </div>

  <table class="meta-table">
    <tr>
      <td style="width:18%;">Mata Kuliah</td>
      <td style="width:2%;">:</td>
      <td style="width:30%;">${data.metadata.mataKuliah}</td>
      <td style="width:15%;" class="meta-divider">Waktu</td>
      <td style="width:2%;">:</td>
      <td style="width:33%;">${data.metadata.waktu}</td>
    </tr>
    <tr>
      <td>Hari / Tanggal</td><td>:</td><td>${data.metadata.hariTanggal}</td>
      <td class="meta-divider">Sifat</td><td>:</td><td>${data.metadata.sifat}</td>
    </tr>
    <tr>
      <td>Kelompok</td><td>:</td><td>${data.metadata.kelompok}</td>
      <td class="meta-divider">Dosen</td><td>:</td><td>${dosen}</td>
    </tr>
  </table>

  <h4>Rancangan Assesment</h4>

  <p class="tabel-label">
    Tabel 1. Capaian Pembelajaran Mata Kuliah (CPMK)
    <strong>${data.metadata.mataKuliah}</strong> adalah sebagai berikut:
  </p>

  <table class="table-bordered">
    ${data.cpmkList
			.map(
				(c: any) => `
      <tr>
        <td style="width:15%; text-align:center;"><strong>${c.id}</strong></td>
        <td>${c.deskripsi}</td>
      </tr>
    `,
			)
			.join("")}
  </table>

  <p class="tabel-label">Tabel 2. Mapping Soal – CPMK – Sub CPMK:</p>

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
      ${data.soalList
				.map(
					(s: any) => `
        <tr>
          <td style="text-align:center;">${s.nomorSoal}.</td>
          <td style="text-align:center;">${s.bentukSoal}</td>
          <td>${s.uraianMateri}</td>
          <td style="text-align:center; white-space:nowrap;">SOAL<br/>No. ${s.nomorSoal}</td>
          <td style="padding:0;">
            <table style="width:100%; height:100%; border-collapse:collapse; border:none; margin:0;">
              <tr>
                <td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:5px 8px; width:45%;"><strong>CPMK:</strong></td>
                <td style="border-bottom:1px solid #000; padding:5px 8px; text-align:center;"><strong>${s.pemetaanCpmk.cpmk}</strong></td>
              </tr>
              <tr>
                <td style="border-right:1px solid #000; padding:5px 8px;"><strong>SCPMK:</strong></td>
                <td style="padding:5px 8px; text-align:center;"><strong>${s.pemetaanCpmk.subCpmk}</strong></td>
              </tr>
            </table>
          </td>
          <td style="text-align:center;"><strong>${s.bobotPersen}</strong></td>
        </tr>
      `,
				)
				.join("")}
    </tbody>
  </table>

</body>
</html>`;
}
