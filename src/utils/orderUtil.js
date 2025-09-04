import Order from "../models/Order.js";

export const countOrdersByStatus = async () => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    pendente: 0,
    preparando: 0,
    entrega: 0,
    finalizado: 0,
    cancelado: 0,
  };

  result.forEach((item) => {
    counts[item._id] = item.total;
  });

  return counts;
};
