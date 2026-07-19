import { useState } from 'react';
import { X, Plus, Trash2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type LineItem = {
  description: string;
  price: number | string;
};

type InvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
};

export function InvoiceModal({ isOpen, onClose, patientName, doctorName, appointmentDate }: InvoiceModalProps) {
  const [items, setItems] = useState<LineItem[]>([{ description: 'Consultation', price: 500 }]);
  const [taxRate, setTaxRate] = useState<number>(0);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', price: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Blue
    doc.text('ZENORA DENTAL', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('123 Smile Avenue, Medical District', 14, 28);
    doc.text('support@zenoradental.com | +91 98765 43210', 14, 33);
    
    // Invoice details
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('INVOICE / RECEIPT', 14, 50);
    
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 60);
    doc.text(`Patient Name: ${patientName}`, 14, 66);
    doc.text(`Attending Doctor: ${doctorName}`, 14, 72);
    doc.text(`Appointment Date: ${appointmentDate}`, 14, 78);

    // Table
    const tableColumn = ["Description", "Amount (INR)"];
    const tableRows = items.map(item => [
      item.description, 
      `Rs. ${Number(item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 90;

    doc.setFontSize(11);
    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Tax (${taxRate}%): Rs. ${taxAmount.toFixed(2)}`, 140, finalY + 18);
    
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text(`Total: Rs. ${total.toFixed(2)}`, 140, finalY + 28);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for trusting Zenora Dental with your smile!', 105, 280, { align: 'center' });

    doc.save(`Invoice_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Generate Invoice</h2>
            <p className="text-sm text-zinc-500">For {patientName} &bull; {doctorName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">Line Items</h3>
              <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-1 h-8">
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-zinc-500">Description</Label>
                    <Input 
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="e.g. Root Canal Treatment"
                      className="h-9"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <Label className="text-xs text-zinc-500">Price (INR)</Label>
                    <Input 
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  <div className="pt-4.5">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <div className="flex justify-between items-center max-w-62.5 ml-auto">
              <span className="text-sm text-zinc-500">Subtotal</span>
              <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center max-w-62.5 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Tax Rate (%)</span>
                <Input 
                  type="number" 
                  className="w-16 h-8 text-right px-2" 
                  value={taxRate} 
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
              <span className="font-medium">Rs. {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center max-w-62.5 ml-auto pt-3 border-t">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="font-bold text-blue-600 text-lg">Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={generatePDF} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4" />
            Download PDF Receipt
          </Button>
        </div>

      </div>
    </div>
  );
}
