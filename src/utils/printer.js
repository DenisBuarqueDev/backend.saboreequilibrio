// utils/printer.js
const escpos = require("escpos");
escpos.USB = require("escpos-usb");

function printOrder(order) {
  try {
    const device = new escpos.USB(); // detecta a impressora USB
    const printer = new escpos.Printer(device);

    device.open(() => {
      printer
        .align("ct")
        .style("b")
        .size(1, 1)
        .text("Sabor e Equilíbrio")
        .text("Pedido do Cliente")
        .text("------------------------------")
        .align("lt")
        .style("normal");

      printer.text(`Cliente: ${order.userId.firstName} ${order.userId.lastName}`);
      printer.text(`Telefone: ${order.userId.phone}`);
      printer.text(`Status: ${order.status}`);
      printer.text("------------------------------");

      order.items.forEach((item) => {
        printer.text(`${item.qtd}x ${item.title} - R$ ${item.subtotal.toFixed(2)}`);
      });

      printer.text("------------------------------");
      printer.text(`Total: R$ ${order.amount.toFixed(2)}`);
      printer.text("------------------------------");

      printer.cut().close();
    });
  } catch (err) {
    console.error("Erro ao imprimir:", err);
  }
}

module.exports = { printOrder };
