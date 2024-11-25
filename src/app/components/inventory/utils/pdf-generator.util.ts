import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem, ProductDetail } from '../interfaces/IInventory';

export class PDFGenerator {
  static generatePDF(item: InventoryItem): void {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Agregar título principal
    doc.setFontSize(14);
    doc.text('NOTA DE MOVIMIENTO', 105, 20, { align: 'center' });
    doc.text(`TIPO: ${item.tipo_operacion}`, 105, 28, { align: 'center' });

    // Información general
    doc.setFontSize(10);
    doc.text(`Documento: ${item.documento_movimiento}`, 14, 40);
    doc.text(`Fecha: ${item.fecha_movimiento}`, 14, 45);
    doc.text(`Nota: ${item.nota || 'Sin nota'}`, 14, 50);

    // Datos de la tabla
    const tableHeaders = ['CÓDIGO', 'NOMBRE', 'UNIDAD', 'CANTIDAD', 'PRECIO/UNITARIO', 'TOTAL'];
    const tableData = item.detalle_productos.map((prod : ProductDetail) => [
      prod.codigo,
      prod.nombre,
      prod.unidad || 'N/A',
      prod.cantidad,
      prod.precio_unitario.toFixed(2),
      prod.total.toFixed(2),
    ]);

    // Generar la tabla con AutoTable
    autoTable(doc, {
      startY: 60,
      head: [tableHeaders],
      body: tableData,
      styles: {
        fontSize: 10,
        halign: 'center',
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
      },
    });

    // Totales
    const totalGeneral = item.detalle_productos.reduce(
      (sum, prod) => sum + prod.total,
      0
    );
    doc.text(`Total General: ${totalGeneral.toFixed(2)}`, 14, 105);

    // Guardar el PDF
    doc.save(`Nota_Movimiento_${item.documento_movimiento}.pdf`);
  }
}
