import SectorSummary from '../models/SectorSummary.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

export async function updateSectorSummaries({ userId, date, product, originalDate }) {
  const day = dayjs(date);
  const original = dayjs(originalDate || date);

  const periods = [
    { periodKey: day.format('YYYY-MM-DD') },
    { periodKey: `2025-W${day.isoWeek()}` }, 
    { periodKey: original.format('YYYY-MM') }
  ];

  for (const { periodKey } of periods) {

    const filter = { userId, sector: product.sector, periodKey };

    // Buscar el resumen correspondiente
    let summary = await SectorSummary.findOne(filter);

    const productTotal = product.price * product.purchasedQuantity;

    if (!summary) {
      // Si no existe el resumen, se crea uno nuevo
      summary = new SectorSummary({
        userId,
        sector: product.sector,
        periodKey,
        totalSpent: productTotal,
        items: [product]
      });
    } else {
      // Revisar si el producto ya está en el resumen
      const existingProduct = summary.items.find(p => p.productId === product.productId);

      if (existingProduct) {
        // Actualizar cantidades y precio (se asume el último precio como el correcto)
        existingProduct.purchasedQuantity += product.purchasedQuantity;
        existingProduct.price = product.price;
        existingProduct.quantity = product.quantity;
        existingProduct.unit = product.unit;
        existingProduct.currency = product.currency;
        existingProduct.brand = product.brand;
      } else {
        // Si no existe, se agrega el producto
        summary.items.push(product);
      }

      // Sumar el gasto total
      summary.totalSpent += productTotal;
    }

    await summary.save();
  }
}
