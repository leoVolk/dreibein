const RANK_ORDER = Object.keys(RANK_COLORS);

const sortByRank = (a: ParticipantsResponse, b: ParticipantsResponse): number => {
  const ai = RANK_ORDER.indexOf(a.rank ?? "");
  const bi = RANK_ORDER.indexOf(b.rank ?? "");
  return (
    (ai === -1 ? RANK_ORDER.length : ai) - (bi === -1 ? RANK_ORDER.length : bi) ||
    (a.lastname ?? "").localeCompare(b.lastname ?? "")
  );
};

const addPageNumbers = (doc: any) => {
  const total = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(`${p} / ${total}`, w - 14, h - 8, { align: "right" });
    doc.setTextColor(0);
  }
};

const drawHeader = (doc: any, title: string, subtitle: string) => {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(subtitle, 14, 24);
  doc.setTextColor(0);
};

const dateStr = () => new Date().toLocaleDateString("de-DE");
const isoDate = () => new Date().toISOString().slice(0, 10);
const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export const useParticipantsPDF = () => {
  const exportRankList = async (participants: ParticipantsResponse[], eventName?: string) => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const sorted = [...participants].sort(sortByRank);
    const doc = new jsPDF({ orientation: "portrait" });

    drawHeader(
      doc,
      eventName ? `Teilnehmerliste – ${eventName}` : "Teilnehmerliste",
      `Erstellt am ${dateStr()} · ${sorted.length} Teilnehmer`,
    );

    autoTable(doc, {
      startY: 30,
      head: [["Nachname", "Vorname", "Stufe"]],
      body: sorted.map((p) => [p.lastname ?? "", p.firstname ?? "", p.rank ?? ""]),
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    addPageNumbers(doc);
    const slug = eventName ? `-${slugify(eventName)}` : "";
    doc.save(`teilnehmerliste${slug}-${isoDate()}.pdf`);
  };

  const exportDietaryList = async (participants: ParticipantsResponse[], eventName?: string) => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const filtered = [...participants]
      .filter((p) => p.dietaryPreferences || p.allergies)
      .sort(sortByRank);

    const doc = new jsPDF({ orientation: "landscape" });

    drawHeader(
      doc,
      eventName ? `Ernährung & Allergien – ${eventName}` : "Ernährung & Allergien",
      `Erstellt am ${dateStr()} · ${filtered.length} Einträge`,
    );

    autoTable(doc, {
      startY: 30,
      head: [["Nachname", "Vorname", "Stufe", "Ernährungswünsche", "Allergien"]],
      body: filtered.map((p) => [
        p.lastname ?? "",
        p.firstname ?? "",
        p.rank ?? "",
        p.dietaryPreferences ?? "",
        p.allergies ?? "",
      ]),
      headStyles: { fillColor: [234, 179, 8], textColor: [30, 30, 30], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 28 },
        2: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
    });

    addPageNumbers(doc);
    const slug = eventName ? `-${slugify(eventName)}` : "";
    doc.save(`ernaehrung-allergien${slug}-${isoDate()}.pdf`);
  };

  const exportHealthList = async (participants: ParticipantsResponse[], eventName?: string) => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const filtered = [...participants]
      .filter((p) => p.illnesses || p.medications)
      .sort(sortByRank);

    const doc = new jsPDF({ orientation: "landscape" });

    drawHeader(
      doc,
      eventName ? `Gesundheit – ${eventName}` : "Gesundheit",
      `Erstellt am ${dateStr()} · ${filtered.length} Einträge`,
    );

    autoTable(doc, {
      startY: 30,
      head: [["Nachname", "Vorname", "Stufe", "Krankheiten", "Medikamente"]],
      body: filtered.map((p) => [
        p.lastname ?? "",
        p.firstname ?? "",
        p.rank ?? "",
        p.illnesses ?? "",
        p.medications ?? "",
      ]),
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 28 },
        2: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
    });

    addPageNumbers(doc);
    const slug = eventName ? `-${slugify(eventName)}` : "";
    doc.save(`gesundheit${slug}-${isoDate()}.pdf`);
  };

  return { exportRankList, exportDietaryList, exportHealthList };
};
