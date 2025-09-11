// utils/printer.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const printer = require("pdf-to-printer");

async function printOrder(order) {
  // caminho temporário do PDF
  const filePath = path.join(__dirname, `order-${order._id}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [226.77, 700], // largura ~70mm
      margins: { top: 5, left: 10, right: 5, bottom: 5 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Cabeçalho
    doc.fontSize(12).text("Sabor e Equilíbrio", { align: "center" });
    doc.fontSize(8).text("Rua Piaçabuçu, 8, Canaã, 57080-030 - Maceió/AL", {
      align: "center",
    });
    doc.fontSize(8).text("59.564.6360001-38", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Cliente: ${order.userId.firstName} ${order.userId.lastName}`);
    doc
      .fontSize(10)
      .text(
        `${order.address.street}, ${order.address.number}, ${order.address.district}, ${order.address.complement}`,
        { align: "left" }
      );
    doc.fontSize(10).text(
      `Pedido realizado: ${new Date(order.createdAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        //second: "2-digit",
        timeZone: "America/Sao_Paulo",
      })}`
    );
    doc.fontSize(10).text(
      `Previsão entrega: ${(() => {
        const date = new Date(order.createdAt);
        date.setMinutes(date.getMinutes() + 50); // Adiciona 50 minutos
        // Extrai a hora formatada (em fuso horário local, ex: Brasília)
        const hour = date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Sao_Paulo",
        });

        return hour;
      })()}`
    );
    doc.moveDown();

    // Itens
    doc.fontSize(10).text("Itens do Pedido:");
    order.items.forEach((item) => {
      doc.table({
        rowStyles: { border: false },
        columnStyles: [
          { width: 170, fontSize: 10 }, // aplica no texto da coluna 1
          { width: 80, fontSize: 10 }, // aplica no texto da coluna 2
        ],
        data: [
          [
            { text: `${item.qtd}x ${item.title}`, fontSize: 10 },
            { text: `R$ ${item.subtotal.toFixed(2)}`, fontSize: 10 },
          ],
          [{ colSpan: 2, text: `${item.description}`, fontSize: 8 }, ""],
        ],
      });
    });

    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Total: R$ ${order.amount.toFixed(2)}`, { align: "right" });
    doc.fontSize(10).text(`Pagamento: ${order.payment}`);
    doc.fontSize(10).text(`Taxa entrega R$ 5,00`);
    doc.moveDown();

    doc.fontSize(8).text("Obrigado pela preferência!", { align: "center" });
    doc
      .fontSize(8)
      .text("https://saboreequilibrio.vercel.app", { align: "center" });

    doc.end();

    stream.on("finish", async () => {
      try {
        // Envia para impressora padrão
        await printer.print(filePath);
        resolve("Pedido impresso com sucesso!");
      } catch (err) {
        reject(err);
      } finally {
        // opcional: excluir o PDF depois
        fs.unlinkSync(filePath);
      }
    });
  });
}

module.exports = { printOrder };
