import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
    

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent {
  generatePDF() {
    const doc = new jsPDF('p', 'mm', 'a4'); // Formato vertical (portrait)
    // Agregar título principal
    doc.setFontSize(14);
    doc.text('NOTA DE INGRESO ALMACEN', 105, 20, { align: 'center' });
    doc.text('FISICO - VALORADO', 105, 28, { align: 'center' });

    // Información general
    doc.setFontSize(10);
    doc.text('Fecha: 25/11/2024', 14, 40);
    doc.text('Código: XXXXXXX', 14, 45);
    doc.text('Proveedor: XXXXXXX', 14, 50);
    doc.text('Número: X', 160, 40);
    doc.text('Documento: XXXXXXX', 160, 45);

    // Datos de la tabla
    const tableHeaders = ['CÓDIGO', 'DETALLE', 'UNIDAD', 'CANTIDAD', 'COSTO/UNITARIO', 'TOTAL'];
    const tableData = [
      ['XX-000000001', 'Lorem ipsum dolor sit amet', 'Metros (m)', '123', '52.00', '1235.00'],
      ['XX-000000002', 'Lorem ipsum dolor sit amet', 'Metros (m)', '234', '32.00', '1324.00'],
      ['XX-000000003', 'Lorem ipsum dolor sit amet', 'Metros (m)', '123', '20.13', '1254.00'],
      ['XX-000000004', 'Lorem ipsum dolor sit amet', 'Metros (m)', '123', '12.00', '1235.00'],
    ];

    // Generar la tabla con AutoTable
    autoTable(doc, {
      startY: 60, // Punto de inicio de la tabla
      head: [tableHeaders],
      body: tableData,
      foot: [['', '', '', '', 'TOTALES', '29320.00']], // Total en el pie de la tabla
      styles: {
        fontSize: 10, // Tamaño de fuente
        halign: 'center', // Alinear horizontalmente
      },
      headStyles: {
        fillColor: [200, 200, 200], // Color del encabezado
        textColor: [0, 0, 0],
      },
      footStyles: {
        fillColor: [200, 200, 200], // Color del pie
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
    });

    // Agregar glosa y firmas

    

    // Guardar el PDF
    doc.save('nota_ingreso_almacen.pdf');
  }
}