// templates/templateElektro.ts

export const htmlTemplateElektro = (data: any) => {
	return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Lembar Soal Ujian</title>
      <style>
        /* MASUKKAN CSS PRINT PDF DI SINI */
        @page {
          size: A4;
          margin: 15mm 20mm; 
        }
        
        body {
          font-family: 'Times New Roman', Times, serif; 
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
        }

        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }

        table.main-layout { width: 100%; border-collapse: collapse; }
        
        .doc-header { width: 100%; border-bottom: 3px double #000; margin-bottom: 15px; padding-bottom: 5px; }
        .doc-header td { vertical-align: middle; }
        .logo { width: 80px; }
        .header-text h1 { margin: 0; font-size: 16pt; font-weight: bold; }
        .header-text h2 { margin: 0; font-size: 14pt; font-weight: bold; }

        .table-bordered { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .table-bordered th, .table-bordered td { border: 1px solid #000; padding: 5px 8px; vertical-align: top; }

        .footer-small { width: 100%; text-align: right; font-size: 10pt; margin-top: 10px; }
        .footer-large { width: 100%; margin-top: 30px; border-collapse: collapse; page-break-inside: avoid; }
        .footer-large td { border: 1px solid #000; padding: 10px; vertical-align: top; width: 50%; }
      </style>
    </head>
    <body>
      <table class="main-layout">
        
        <thead>
          <tr>
            <td>
              <table class="doc-header">
                <tr>
                  <td width="15%">
                    <img src="https://via.placeholder.com/80x80?text=Logo" class="logo" alt="Logo Udinus" />
                  </td>
                  <td width="65%" class="header-text">
                    <h2>FAKULTAS TEKNIK</h2>
                    <h1>UNIVERSITAS DIAN NUSWANTORO</h1>
                    <p style="font-size: 10pt; margin: 0;">Jl. Nakula I No.1 Gedung I. Telp. (024) 3555628 Semarang 50131</p>
                  </td>
                  <td width="20%" style="text-align: right; font-size: 9pt; vertical-align: top;">
                    FM-UDINUS-BM-04-15/R1
                  </td>
                </tr>
              </table>
              <div style="text-align: center; font-weight: bold; margin-bottom: 15px; line-height: 1.2;">
                UJIAN AKHIR SEMESTER GENAP T.A. 2025/2026<br/>
                L E M B A R S O A L
              </div>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <div class="page-1">
                <table class="table-bordered avoid-break">
                  <tr>
                    <td width="15%">Mata Kuliah</td>
                    <td width="35%">: ${data.metadata.mataKuliah}</td>
                    <td width="15%">Waktu</td>
                    <td width="35%">: ${data.metadata.waktu}</td>
                  </tr>
                  <tr>
                    <td>Hari/Tanggal</td>
                    <td>: ${data.metadata.hariTanggal}</td>
                    <td>Sifat</td>
                    <td>: ${data.metadata.sifat}</td>
                  </tr>
                  <tr>
                    <td>Kelompok</td>
                    <td>: ${data.metadata.kelompok}</td>
                    <td>Dosen</td>
                    <td>: ${data.metadata.dosenPengampu.join(", ")}</td>
                  </tr>
                </table>

                <h4 style="margin: 10px 0 5px 0;">Rancangan Assesment</h4>
                <p style="margin-bottom: 5px;">Tabel 1. Capaian Pembelajaran Mata Kuliah (CPMK) <strong>${data.metadata.mataKuliah}</strong> adalah sebagai berikut:</p>
                
                <table class="table-bordered avoid-break">
                  ${data.cpmkList
										.map(
											(cpmk: any) => `
                    <tr>
                      <td width="15%"><strong>${cpmk.id}</strong></td>
                      <td>${cpmk.deskripsi}</td>
                    </tr>
                  `,
										)
										.join("")}
                </table>

                <p style="margin-bottom: 5px;">Tabel 2. Mapping Soal – CPMK – Sub CPMK:</p>
                <table class="table-bordered avoid-break">
                  <tr>
                    <th>No.</th>
                    <th>Bentuk Soal</th>
                    <th>URAIAN MATERI</th>
                    <th>CPMK dan SCPMK</th>
                    <th>BOBOT SOAL (%)</th>
                  </tr>
                  ${data.soalList
										.map(
											(soal: any) => `
                    <tr>
                      <td align="center">${soal.nomorSoal}</td>
                      <td>${soal.bentukSoal}</td>
                      <td>${soal.uraianMateri}</td>
                      <td>
                        <strong>CPMK:</strong> ${soal.pemetaanCpmk.cpmk} <br/>
                        <strong>SCPMK:</strong> ${soal.pemetaanCpmk.subCpmk}
                      </td>
                      <td align="center">${soal.bobotPersen}%</td>
                    </tr>
                  `,
										)
										.join("")}
                </table>
              </div>

              <div class="page-break">
                <table class="table-bordered avoid-break">
                  <tr>
                    <td width="15%">Mata Kuliah</td>
                    <td width="35%">: ${data.metadata.mataKuliah}</td>
                    <td width="15%">Waktu</td>
                    <td width="35%">: ${data.metadata.waktu}</td>
                  </tr>
                  <tr>
                    <td>Hari/Tanggal</td>
                    <td>: ${data.metadata.hariTanggal}</td>
                    <td>Sifat</td>
                    <td>: ${data.metadata.sifat}</td>
                  </tr>
                  <tr>
                    <td>Kelompok</td>
                    <td>: ${data.metadata.kelompok}</td>
                    <td>Dosen</td>
                    <td>: ${data.metadata.dosenPengampu.join(", ")}</td>
                  </tr>
                </table>
                <br/>

                ${data.soalList
									.map(
										(soal: any) => `
                  <div class="avoid-break" style="margin-bottom: 20px;">
                    <table width="100%">
                      <tr>
                        <td width="5%" valign="top"><strong>${soal.nomorSoal}.</strong></td>
                        <td width="95%" valign="top">
                          <p style="margin-top: 0;">${soal.kontenSoal.teksPertanyaan}</p>
                          ${soal.kontenSoal.gambarPendukung
														.map(
															(imgBase64: string) => `
                            <img src="${imgBase64}" style="max-width: 100%; height: auto; margin-top: 10px; display: block;" />
                          `,
														)
														.join("")}
                        </td>
                      </tr>
                    </table>
                  </div>
                `,
									)
									.join("")}

                <table class="footer-large">
                  <tr>
                    <td>
                      Diperiksa oleh : Koordinator Mata Kuliah<br/>
                      Nama : ${data.pengesahan.koordinatorMk.nama}<br/>
                      Tanggal : ${data.pengesahan.koordinatorMk.tanggal}<br/><br/><br/>
                      Tanda tangan : _________________
                    </td>
                    <td>
                      Disahkan oleh : Kaprogdi Teknik Elektro<br/>
                      Nama : ${data.pengesahan.kaprogdi.nama}<br/>
                      Tanggal : ${data.pengesahan.kaprogdi.tanggal}<br/><br/><br/>
                      Tanda tangan : _________________
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td>
              <table class="footer-small">
                <tr>
                  <td style="border: 1px dashed #000; padding: 5px; text-align: left; width: 150px; float: right;">
                    Paraf Koordinator MK : <br/><br/>
                    Paraf Kaprogdi :
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tfoot>

      </table>
    </body>
    </html>
  `;
};
