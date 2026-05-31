const imageToCanvas = (blob: Blob): Promise<string> => {
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };
    img.src = objectUrl;
  });
};

const renderPdfPages = async (url: string): Promise<string[]> => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).href;

  const pdf = await pdfjsLib.getDocument({ url }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
    pages.push(canvas.toDataURL("image/png"));
  }

  return pages;
};

export const useInvoicePDF = () => {
  const { pb } = usePocketbase();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

  // ── Summary PDF: one table per category ─────────────────────────────────────
  const exportPDF = async (invoices: InvoicesResponse[], eventName?: string) => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`Abrechnung ${eventName}`, 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Erstellt am ${new Date().toLocaleDateString("de-DE")}`, 14, eventName ? 36 : 29);
    doc.setTextColor(0);

    let y = eventName ? 44 : 37;

    const NONE = "Ohne Kategorie";
    const grouped = new Map<string, InvoicesResponse[]>();
    for (const invoice of invoices) {
      const cat = invoice.category || NONE;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(invoice);
    }

    const categories = [...grouped.keys()].sort((a, b) => {
      if (a === NONE) return 1;
      if (b === NONE) return -1;
      return a.localeCompare("de");
    });

    let grandTotal = 0;

    for (const category of categories) {
      const items = grouped.get(category)!;
      const subtotal = items.reduce((sum, inv) => sum + (inv.value ?? 0), 0);
      grandTotal += subtotal;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(category, 14, y);
      y += 2;

      autoTable(doc, {
        startY: y,
        head: [["Name", "Datum", "Betrag"]],
        body: [
          ...items.map((inv) => [
            inv.name || "Ohne Titel",
            formatDate(inv.paidAt),
            formatCurrency(inv.value ?? 0),
          ]),
          [
            { content: "", styles: { fontStyle: "bold" } },
            { content: "Gesamt", styles: { fontStyle: "bold" } },
            { content: formatCurrency(subtotal), styles: { fontStyle: "bold", halign: "right" } },
          ],
        ],
        headStyles: { fillColor: [22, 163, 74], fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { halign: "right", cellWidth: 30 },
          2: { halign: "right", cellWidth: 35 },
        },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 14;
    }

    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.line(14, y - 4, pageWidth - 14, y - 4);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Gesamtbetrag", 14, y + 2);
    doc.text(formatCurrency(grandTotal), pageWidth - 14, y + 2, { align: "right" });

    doc.save(
      eventName
        ? `rechnungen-${eventName.toLowerCase().replace(/\s+/g, "-")}.pdf`
        : "rechnungen.pdf",
    );
  };

  // ── Receipts PDF: one invoice per page with embedded image ──────────────────
  const exportReceiptsPDF = async (invoices: InvoicesResponse[], eventName?: string) => {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const footerY = pageHeight - margin;

    const fileToken = await pb.files.getToken();

    let firstPage = true;
    for (const invoice of invoices) {
      if (!firstPage) doc.addPage();
      firstPage = false;

      // ── Name (top left) ────────────────────────────────────────────────────
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(invoice.name || "Ohne Titel", margin, 20);

      if (invoice.category) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120);
        doc.text(invoice.category, margin, 27);
        doc.setTextColor(0);
      }

      // ── Image (centered, fills available space) ────────────────────────────
      const headerH = 32;
      const footerH = 18;
      const availW = pageWidth - margin * 2;
      const availH = pageHeight - headerH - footerH;

      if (invoice.file && /\.(jpg|jpeg|png|webp|gif)$/i.test(invoice.file)) {
        try {
          const url = pb.files.getURL(invoice, invoice.file, { token: fileToken });
          const blob = await fetch(url).then((r) => r.blob());
          const base64 = await imageToCanvas(blob);

          const props = doc.getImageProperties(base64);
          const ratio = Math.min(availW / props.width, availH / props.height);
          const imgW = props.width * ratio;
          const imgH = props.height * ratio;
          const x = (pageWidth - imgW) / 2;
          const y = headerH + (availH - imgH) / 2;

          doc.setDrawColor(210);
          doc.setLineWidth(0.3);
          doc.rect(x, y, imgW, imgH);
          doc.addImage(base64, "PNG", x, y, imgW, imgH);
        } catch {
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text("Bild konnte nicht geladen werden.", margin, headerH + 10);
          doc.setTextColor(0);
        }
      } else if (invoice.file && /\.pdf$/i.test(invoice.file)) {
        try {
          const url = pb.files.getURL(invoice, invoice.file, { token: fileToken });
          const pdfPages = await renderPdfPages(url);
          let isFirstPdfPage = true;
          for (const pageDataUrl of pdfPages) {
            if (!isFirstPdfPage) {
              doc.addPage();
              // Repeat name header on continuation pages
              doc.setFontSize(16);
              doc.setFont("helvetica", "bold");
              doc.text(invoice.name || "Ohne Titel", margin, 20);
            }
            isFirstPdfPage = false;
            const props = doc.getImageProperties(pageDataUrl);
            const ratio = Math.min(availW / props.width, availH / props.height);
            const imgW = props.width * ratio;
            const imgH = props.height * ratio;
            const x = (pageWidth - imgW) / 2;
            const y = headerH + (availH - imgH) / 2;
            doc.setDrawColor(210);
            doc.setLineWidth(0.3);
            doc.rect(x, y, imgW, imgH);
            doc.addImage(pageDataUrl, "PNG", x, y, imgW, imgH);
          }
        } catch {
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text("PDF konnte nicht geladen werden.", margin, headerH + 10);
          doc.setTextColor(0);
        }
      }

      // ── Footer: date (left) · value (right) ───────────────────────────────
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      if (invoice.paidAt) {
        doc.text(formatDate(invoice.paidAt), margin, footerY);
      }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(formatCurrency(invoice.value ?? 0), pageWidth - margin, footerY, { align: "right" });
    }

    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(`${p} / ${total}`, pageWidth - margin, margin, { align: "right" });
      doc.setTextColor(0);
    }

    doc.save(
      eventName
        ? `belege-${eventName.toLowerCase().replace(/\s+/g, "-")}.pdf`
        : "belege.pdf",
    );
  };

  return { exportPDF, exportReceiptsPDF };
};
