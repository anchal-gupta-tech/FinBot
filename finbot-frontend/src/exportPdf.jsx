import { jsPDF } from "jspdf";

export function exportChatToPDF(messages, chatName = "FinBot_Chat") {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Title
  doc.setFontSize(18);
  doc.text(chatName, margin, cursorY);
  cursorY += 30;

  // Timestamp
  doc.setFontSize(10);
  doc.text(`Exported on: ${new Date().toLocaleString()}`, margin, cursorY);
  cursorY += 20;

  doc.setFontSize(12);

  messages.forEach((msg) => {
    const header = `${msg.time} — ${msg.sender === "user" ? "User" : "FinBot"}`;
    const body = msg.text;

    // Add header
    doc.setFont(undefined, "bold");
    const headerLines = doc.splitTextToSize(header, maxWidth);

    headerLines.forEach((line) => {
      if (cursorY + 16 > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 16;
    });

    // Add message body
    doc.setFont(undefined, "normal");
    const bodyLines = doc.splitTextToSize(body, maxWidth);

    bodyLines.forEach((line) => {
      if (cursorY + 16 > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin + 10, cursorY);
      cursorY += 16;
    });

    cursorY += 10;

    // Separator line
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);

    cursorY += 12;
  });

  const filename = `${chatName}_${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.pdf`;

  doc.save(filename);
}
