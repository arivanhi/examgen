import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { htmlTemplateElektro } from "../../../templates/templateElektro";

export async function POST(request: Request) {
	try {
		const data = await request.json();

		// 1. Injeksi data JSON ke dalam string HTML
		const finalHtml = htmlTemplateElektro(data);

		// 2. Jalankan Puppeteer
		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		const page = await browser.newPage();

		// 3. Render HTML ke halaman browser virtual
		await page.setContent(finalHtml, { waitUntil: "networkidle0" });

		// 4. Konversi ke PDF
		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			displayHeaderFooter: true,
			footerTemplate: `
        <style>
          .footer-container { width: 100%; font-size: 10pt; text-align: right; padding-right: 20mm; }
        </style>
        <div class="footer-container">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
			headerTemplate: `<div></div>`,
			margin: { top: "15mm", bottom: "20mm", left: "20mm", right: "20mm" },
		});

		await browser.close();

		// 5. Kembalikan file PDF ke client
		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'attachment; filename="Soal_Ujian_Elektro.pdf"',
			},
		});
	} catch (error) {
		console.error("Error generating PDF:", error);
		return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
	}
}
