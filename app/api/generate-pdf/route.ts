// app/api/generate-pdf/route.ts

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { htmlTemplateAssessment } from "../../../templates/assesmentTemplates";
import { htmlTemplateQuestions, htmlPengesahanStamp, htmlParafStamp } from "../../../templates/questionsTemplates";

const MM = 2.8346; // Pengali konversi milimeter ke pixel (points)

// ─── HELPER BARU: Menunggu MathJax selesai merender LaTeX ───────────────
async function renderHtml(browser: any, html: string) {
	const page = await browser.newPage();

	// Gunakan networkidle0 agar script MathJax dari CDN selesai di-download
	await page.setContent(html, { waitUntil: "networkidle0", timeout: 30_000 });

	// Paksa Puppeteer menunggu hingga MathJax (jika ada) selesai merender rumus
	await page.evaluate(async () => {
		if ((window as any).MathJax && (window as any).MathJax.startup) {
			await (window as any).MathJax.startup.promise;
		}
	});

	return page;
}
// ────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	try {
		const data = await request.json();

		// BACA LOGO DARI FOLDER PUBLIC & CONVERT KE BASE64
		try {
			const logoPath = path.join(process.cwd(), "public", "logo_dinus.png");
			const logoBuffer = fs.readFileSync(logoPath);
			data.logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
		} catch (err) {
			console.warn("Logo logo_dinus.png tidak ditemukan, menggunakan placeholder.");
			data.logoBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
		}

		// 1. Generate PDF Assessment
		const page1 = await browser.newPage();
		await page1.setContent(htmlTemplateAssessment(data), { waitUntil: "load" });
		const assessmentBuffer = await page1.pdf({
			width: "215mm",
			height: "330mm",
			printBackground: true,
			margin: { top: "0", bottom: "0", left: "0", right: "0" },
		});
		await page1.close();

		// 2. Generate PDF Questions Utama (Menggunakan Helper MathJax)
		const page2 = await renderHtml(browser, htmlTemplateQuestions(data));
		const rawQuestionsBuffer = await page2.pdf({
			width: "215mm",
			height: "330mm",
			printBackground: true,
			displayHeaderFooter: false, // Tanpa nomor halaman
			margin: { top: "15mm", bottom: "55mm", left: "20mm", right: "20mm" },
		});
		await page2.close();

		// 3. Generate Stempel Pengesahan (DIPERTINGGI JADI 45mm agar batas bawah tidak hilang)
		const pageP = await browser.newPage();
		await pageP.setContent(htmlPengesahanStamp(data), { waitUntil: "load" });
		const pengesahanBuffer = await pageP.pdf({
			width: "175mm",
			height: "45mm",
			printBackground: true,
			margin: { top: "0", bottom: "0", left: "0", right: "0" },
		});
		await pageP.close();

		// 4. Generate Stempel Paraf (DIPERLEBAR JADI 65mm, TINGGI 25mm agar tidak tergencet)
		const pageParaf = await browser.newPage();
		await pageParaf.setContent(htmlParafStamp(), { waitUntil: "load" });
		const parafBuffer = await pageParaf.pdf({
			width: "65mm",
			height: "25mm",
			printBackground: true,
			margin: { top: "0", bottom: "0", left: "0", right: "0" },
		});
		await pageParaf.close();

		// =========================================================================
		// 5. PROSES STAMPING DENGAN PDF-LIB
		// =========================================================================
		const mainDoc = await PDFDocument.load(rawQuestionsBuffer);

		const [pengesahanEmbed] = await mainDoc.embedPdf(pengesahanBuffer, [0]);
		const [parafEmbed] = await mainDoc.embedPdf(parafBuffer, [0]);

		const pages = mainDoc.getPages();
		const totalPages = pages.length;

		for (let i = 0; i < totalPages; i++) {
			const p = pages[i];

			if (i === totalPages - 1) {
				// Halaman Terakhir: Stempel Pengesahan (1cm dari bawah)
				p.drawPage(pengesahanEmbed, {
					x: 20 * MM,
					y: 10 * MM,
					width: 175 * MM,
					height: 45 * MM,
				});
			} else {
				// Halaman Lain: Stempel Paraf (1cm dari bawah, nempel rata kanan margin)
				p.drawPage(parafEmbed, {
					x: (215 - 20 - 65) * MM,
					y: 10 * MM,
					width: 65 * MM,
					height: 25 * MM,
				});
			}
		}

		const finalQuestionsBuffer = await mainDoc.save();

		return NextResponse.json({
			assessmentPdf: Buffer.from(assessmentBuffer).toString("base64"),
			questionsPdf: Buffer.from(finalQuestionsBuffer).toString("base64"),
		});
	} catch (error) {
		console.error("[generate-pdf] Error:", error);
		return NextResponse.json({ error: "Gagal generate PDF", detail: String(error) }, { status: 500 });
	} finally {
		await browser.close();
	}
}
