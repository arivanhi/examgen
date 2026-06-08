// templates/templateElektro.ts

export const htmlTemplateElektro = (data: any) => {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Lembar Soal Ujian</title>
      <style>
        @page {
          size: 215mm 330mm; /* Kertas F4 */
          margin: 15mm 20mm; 
        }
        
        body {
          font-family: 'Times New Roman', Times, serif !important; 
          font-size: 11pt;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
          position: relative;
        }

        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }

        table.main-layout { width: 100%; border-collapse: collapse; }
        
        .doc-header { width: 100%; border-bottom: 3px double #000; margin-bottom: 15px; padding-bottom: 5px; }
        .doc-header td { vertical-align: middle; }
        .logo { width: 80px; }
        .header-text h1 { margin: 0; font-size: 16pt; font-weight: bold; }
        .header-text h2 { margin: 0; font-size: 14pt; font-weight: bold; }

        .meta-table { width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt; }
        .meta-table td { padding: 4px 8px; vertical-align: top; }
        .meta-divider { border-left: 1px solid #000; }

        .table-bordered { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .table-bordered th, .table-bordered td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }

        /* PARAF KECIL (Posisi Terkunci di Semua Halaman) */
        .paraf-fixed {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 250px;
          z-index: 1;
          background: white;
        }
        .paraf-small { border-collapse: collapse; width: 100%; font-size: 9pt; }
        .paraf-small td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
        .paraf-small .label-col { border-right: none; width: 40%; }
        .paraf-small .sign-col { border-left: none; text-align: left; width: 60%; }

        /* PENGESAHAN BESAR (Trik Menutupi Paraf) */
        #pengesahan-container {
          background: white;
          position: relative;
          z-index: 10;
          margin-bottom: -90px; /* Ditarik masuk ke area padding bawah */
          padding-bottom: 90px; /* Diekspansi putih untuk menelan Paraf di belakangnya */
        }
        .pengesahan-table { width: 100%; border-collapse: collapse; font-size: 9pt; table-layout: fixed; }
        .pengesahan-table td { border: 1px solid #000; padding: 8px; vertical-align: top; }
        .inner-pengesahan { width: 100%; border-collapse: collapse; }
        .inner-pengesahan td { padding: 3px 5px; vertical-align: top; border: none; }
      </style>
    </head>
    <body>
      <div id="page-measure" style="position: absolute; top: 0; left: 0; height: 100vh; width: 1px; visibility: hidden; z-index: -100;"></div>

      <div class="paraf-fixed">
        <table class="paraf-small">
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

      <table class="main-layout">
        <thead>
          <tr>
            <td>
              <table class="doc-header">
                <tr>
                  <td width="15%">
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="logo" alt="Logo Udinus" />
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
              <div style="text-align: center; font-weight: bold; margin-bottom: 15px; line-height: 1.2; font-size: 12pt;">
                UJIAN AKHIR SEMESTER GENAP T.A. 2025/2026<br/>
                L E M B A R &nbsp; S O A L
              </div>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td class="main-td" style="padding: 0; padding-bottom: 90px; vertical-align: top;">

              <div class="page-1">
                <table class="meta-table avoid-break">
                  <tr>
                    <td width="18%">Mata Kuliah</td><td width="2%">:</td><td width="30%">${data.metadata.mataKuliah}</td>
                    <td width="15%" class="meta-divider">Waktu</td><td width="2%">:</td><td width="33%">${data.metadata.waktu}</td>
                  </tr>
                  <tr>
                    <td>Hari / Tanggal</td><td>:</td><td>${data.metadata.hariTanggal}</td>
                    <td class="meta-divider">Sifat</td><td>:</td><td>${data.metadata.sifat}</td>
                  </tr>
                  <tr>
                    <td>Kelompok</td><td>:</td><td>${data.metadata.kelompok}</td>
                    <td class="meta-divider">Dosen</td><td>:</td><td>${data.metadata.dosenPengampu.join(", ")}</td>
                  </tr>
                </table>

                <h4 style="margin: 10px 0 5px 0;">Rancangan Assesment</h4>
                <p style="margin-bottom: 5px;">Tabel 1. Capaian Pembelajaran Mata Kuliah (CPMK) <strong>${data.metadata.mataKuliah}</strong> adalah sebagai berikut:</p>
                
                <table class="table-bordered avoid-break">
                  ${data.cpmkList.map((cpmk: any) => `
                    <tr>
                      <td width="15%" align="center"><strong>${cpmk.id}</strong></td>
                      <td>${cpmk.deskripsi}</td>
                    </tr>
                  `).join('')}
                </table>

                <p style="margin-bottom: 5px;">Tabel 2. Mapping Soal – CPMK – Sub CPMK:</p>
                
                <table class="table-bordered avoid-break" style="font-size: 9pt;">
                  <tr>
                    <th align="center" width="5%">No.</th>
                    <th align="center" width="15%">Bentuk Soal</th>
                    <th align="center" colspan="2" width="30%">URAIAN MATERI</th>
                    <th align="center" width="35%">CPMK dan SCPMK</th>
                    <th align="center" width="15%">BOBOT SOAL (%)</th>
                  </tr>
                  ${data.soalList.map((soal: any) => `
                    <tr>
                      <td align="center">${soal.nomorSoal}.</td>
                      <td align="center">${soal.bentukSoal}</td>
                      <td>${soal.uraianMateri}</td>
                      <td align="center" style="white-space: nowrap;">SOAL<br/>No. ${soal.nomorSoal}</td>
                      
                      <td style="padding: 0;">
                        <table style="width: 100%; height: 100%; border-collapse: collapse; border: none; margin: 0;">
                          <tr>
                            <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 5px 8px; width: 45%;"><strong>CPMK:</strong></td>
                            <td style="border-bottom: 1px solid #000; padding: 5px 8px; text-align: center; border-right: none;"><strong>${soal.pemetaanCpmk.cpmk}</strong></td>
                          </tr>
                          <tr>
                            <td style="border-right: 1px solid #000; padding: 5px 8px; border-bottom: none;"><strong>SCPMK:</strong></td>
                            <td style="padding: 5px 8px; text-align: center; border-bottom: none; border-right: none;"><strong>${soal.pemetaanCpmk.subCpmk}</strong></td>
                          </tr>
                        </table>
                      </td>

                      <td align="center"><strong>${soal.bobotPersen}</strong></td>
                    </tr>
                  `).join('')}
                </table>
              </div>

              <div class="page-break"></div>

              <div id="soal-content">
                <table class="meta-table avoid-break">
                  <tr>
                    <td width="18%">Mata Kuliah</td><td width="2%">:</td><td width="30%">${data.metadata.mataKuliah}</td>
                    <td width="15%" class="meta-divider">Waktu</td><td width="2%">:</td><td width="33%">${data.metadata.waktu}</td>
                  </tr>
                  <tr>
                    <td>Hari / Tanggal</td><td>:</td><td>${data.metadata.hariTanggal}</td>
                    <td class="meta-divider">Sifat</td><td>:</td><td>${data.metadata.sifat}</td>
                  </tr>
                  <tr>
                    <td>Kelompok</td><td>:</td><td>${data.metadata.kelompok}</td>
                    <td class="meta-divider">Dosen</td><td>:</td><td>${data.metadata.dosenPengampu.join(", ")}</td>
                  </tr>
                </table>
                <br/>

                ${data.soalList.map((soal: any) => `
                  <div class="avoid-break" style="margin-bottom: 20px;">
                    <table width="100%">
                      <tr>
                        <td width="5%" valign="top"><strong>${soal.nomorSoal}.</strong></td>
                        <td width="95%" valign="top">
                          <p style="margin-top: 0;">${soal.kontenSoal.teksPertanyaan}</p>
                          ${soal.kontenSoal.gambarPendukung.map((imgBase64: string) => `
                            <img src="${imgBase64}" style="max-width: 100%; height: auto; margin-top: 10px; display: block;" />
                          `).join('')}
                        </td>
                      </tr>
                    </table>
                  </div>
                `).join('')}
              </div>

              <div id="pengesahan-container">
                <div id="pengesahan-inner">
                  <table class="pengesahan-table">
                    <tr>
                      <td width="50%">
                        <table class="inner-pengesahan">
                          <tr><td width="30%">Diperiksa oleh</td><td width="5%">:</td><td>Koordinator Mata Kuliah</td></tr>
                          <tr><td>Nama</td><td>:</td><td>${data.pengesahan.koordinatorMk.nama}</td></tr>
                          <tr><td>Tanggal</td><td>:</td><td>${data.pengesahan.koordinatorMk.tanggal}</td></tr>
                          <tr><td>Tandatangan</td><td>:</td><td style="height: 60px;"></td></tr>
                        </table>
                      </td>
                      <td width="50%">
                        <table class="inner-pengesahan">
                          <tr><td width="30%">Disahkan oleh</td><td width="5%">:</td><td>Kaprogdi Teknik Elektro</td></tr>
                          <tr><td>Nama</td><td>:</td><td>${data.pengesahan.kaprogdi.nama}</td></tr>
                          <tr><td>Tanggal</td><td>:</td><td>${data.pengesahan.kaprogdi.tanggal}</td></tr>
                          <tr><td>Tandatangan</td><td>:</td><td style="height: 60px;"></td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

            </td>
          </tr>
        </tbody>
      </table>

      <script>
        document.addEventListener("DOMContentLoaded", function() {
          try {
            var measure = document.getElementById('page-measure');
            var pageH = measure.getBoundingClientRect().height;

            var thead = document.querySelector('thead');
            var headerH = thead.getBoundingClientRect().height;

            var td = document.querySelector('.main-td');
            var pb = parseFloat(window.getComputedStyle(td).paddingBottom); 

            // Menghitung zona aman untuk soal per halaman
            var effectivePageH = pageH - headerH - pb;

            var soalContent = document.getElementById('soal-content');
            var soalH = soalContent.getBoundingClientRect().height;

            var footerInner = document.getElementById('pengesahan-inner');
            var trueFooterH = footerInner.getBoundingClientRect().height;
            var footerContainer = document.getElementById('pengesahan-container');

            // Kalkulasi sisa ruang di halaman soal terakhir
            var usedOnLastPage = soalH % effectivePageH;
            if (usedOnLastPage === 0 && soalH > 0) {
                usedOnLastPage = effectivePageH;
            }

            var spaceLeft = effectivePageH - usedOnLastPage;
            var pushAmount = 0;

            // Jika ruang sisa tidak muat untuk tabel pengesahan, otomatis lompat ke dasar halaman berikutnya
            if (spaceLeft < trueFooterH) {
                pushAmount = spaceLeft + (effectivePageH - trueFooterH) - 2;
            } else {
                pushAmount = spaceLeft - trueFooterH - 2;
            }

            // Mendorong tabel ke dasar halaman
            if (pushAmount > 0) {
                footerContainer.style.marginTop = pushAmount + 'px';
            }
          } catch (e) {
            console.error(e);
          }
        });
      </script>
    </body>
    </html>
  `;
};