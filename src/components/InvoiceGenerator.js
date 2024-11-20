import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "bootstrap/dist/css/bootstrap.min.css";
import "./InvoiceGenerator.css";
import logo from "../assets/logo.jpg";

const InvoiceGenerator = () => {
  const [items, setItems] = useState([{ name: "", description: "", qty: 1, price: 0 }]);
  const [billTo, setBillTo] = useState({ name: "" });
  const [errors, setErrors] = useState({ name: false });
  const [serial, setSerial] = useState(1); // Serial number for Customer ID
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);

  const validateInputs = () => {
    const newErrors = {
      name: !billTo.name.trim(),
    };
    setErrors(newErrors);
    return !newErrors.name; // Valid if no errors
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", description: "", qty: 1, price: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => items.reduce((total, item) => total + item.qty * item.price, 0);

  const calculateTax = () => (calculateSubtotal() * taxRate) / 100;

  const calculateDiscount = () => (calculateSubtotal() * discountRate) / 100;

  const calculateTotal = () => calculateSubtotal() + calculateTax() - calculateDiscount();
  // Format date for Invoice Number: ddmmyy
const formatDateForInvoice = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = String(now.getFullYear()).slice(-2); // Get last two digits of year
  return `${day}${month}${year}`;
};

// Format date for display: dd-mm-yy
const formatDateForDisplay = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

  const convertToWords = (num) => {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num === 0) return "Zero";
    const getHundreds = (n) =>
      n > 99 ? `${a[Math.floor(n / 100)]} Hundred ${n % 100 > 0 ? getTens(n % 100) : ""}` : getTens(n);

    const getTens = (n) => (n > 19 ? `${b[Math.floor(n / 10)]} ${a[n % 10]}` : a[n]);

    const millions = Math.floor(num / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    

    const parts = [];
    if (millions) parts.push(`${getHundreds(millions)} Million`);
    if (thousands) parts.push(`${getHundreds(thousands)} Thousand`);
    if (remainder) parts.push(getHundreds(remainder));

    return parts.join(", ");
  };

  const downloadPDF = () => {
    if (!validateInputs()) return;

    const content = document.getElementById("invoice-content");
    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      const fileName = billTo.name ? `${billTo.name.replace(/\s+/g, "_")}_Invoice.pdf` : "invoice.pdf";
      pdf.save(fileName);
    });
  };

  const generateCustomerID = () => {
    const invoiceNumber = generateInvoiceNumber();
    const sanitizedBillToName = billTo.name.trim().replace(/\s+/g, "").toUpperCase(); // Remove spaces and uppercase
  
    return sanitizedBillToName ? `${sanitizedBillToName}-${invoiceNumber}` : `N/A-${invoiceNumber}`;
  };
  
  const generateInvoiceNumber = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
  
    return `${day}${month}${year}${hours}${minutes}`;
  };

  
  

  return (
    <div className="invoice-generator container mt-4">
  <h2 className="text-center mb-4">Invoice Generator</h2>
  <div id="invoice-content" className="p-4 border">
    {/* Invoice Header */}
    <div id="invoice-header" className="d-flex justify-content-between align-items-start mb-4">
  {/* Left Section: Logo and Address */}
  <div className="text-start">
    <img src={logo} alt="Company Logo" style={{ maxHeight: "50px" }} />
    <p className="mt-2 mb-1"><strong>Head Office:</strong></p>
    <p className="mb-1">4, Duduyemi Street, Bucknor, Jakande Gate, Isolo, Oshodi Isolo LGA, Lagos.</p>
    <p className="mb-1">Tel: 08035890419, 07089477476</p>
    <p className="mb-1">Email: zephyng@gmail.com</p>
    <p className="mb-1">Website: www.zlesglobal.com</p>
    <p className="mt-2 mb-1"><strong>Branch Office:</strong></p>
    <p>34A, New Face Plaza, Opposite Relief Market, Owerri, Imo State.</p>
  </div>

  {/* Right Section: Invoice Details */}
  <div className="text-end">
    <h3><strong>INVOICE</strong></h3>
    <p><strong>Invoice Number:</strong> {`${generateInvoiceNumber()}`}</p>
    <p><strong>Invoice Date:</strong> {formatDateForDisplay()}</p>
  </div>
</div>


    {/* Bill To Section */}
    <div className="bill-to mb-4">
  <div className="row">
    {/* Client Name Input */}
    <div className="col-md-6">
      <label htmlFor="billToName" className="form-label">Bill To</label>
      <input
        id="billToName"
        type="text"
        placeholder="Enter Client Name"
        className={`form-control ${errors.name ? "is-invalid" : ""}`}
        value={billTo.name}
        onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
      />
      {errors.name && <div className="text-danger">Name is required</div>}

      {/* Customer ID */}
      <p className="mt-3">
        <strong>Customer ID:</strong> {generateCustomerID()}
      </p>
    </div>

    {/* Account Numbers */}
    <div className="col-md-6">
      <label className="form-label"><strong>Account Numbers</strong></label>
      <ul className="list-unstyled">
        <li>Eco Bank: 2940037688</li>
        <li>Fidelity Bank: 5601019087</li>
        <li>Access Bank: 1895006692</li>
      </ul>
    </div>
  </div>
</div>


    {/* Items Section */}
    <h5>Items:</h5>
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Quantity</th>
          <th>Item Description</th>
          <th>Unit Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td>{item.qty}</td>
            <td>{item.name}</td>
            <td>₦{item.price.toFixed(2)}</td>
            <td>₦{(item.qty * item.price).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Summary Section */}
    <div className="text-end">
      <p><strong>Subtotal:</strong> ₦{calculateSubtotal().toFixed(2)}</p>
      <p><strong>Sales Tax:</strong> ₦{calculateTax().toFixed(2)}</p>
      <p><strong>Discount:</strong> ₦{calculateDiscount().toFixed(2)}</p>
      <h5><strong>Total:</strong> ₦{calculateTotal().toFixed(2)}</h5>
    </div>

    {/* Footer */}
    <div id="invoice-footer" className="text-center mt-4">
      <p><strong>Amount in Words:</strong> {convertToWords(calculateTotal())} Naira Only</p>
    </div>
  </div>

  {/* Add/Edit Items Section */}
  <h5>Add/Edit Items:</h5>
  {items.map((item, index) => (
    <div key={index} className="row mb-3 align-items-center item-row">
      <div className="col-md-4">
        <label className="form-label">Item Name</label>
        <input
          type="text"
          placeholder="Enter Item Name"
          className="form-control"
          value={item.name}
          onChange={(e) => handleItemChange(index, "name", e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <label className="form-label">Quantity</label>
        <input
          type="number"
          placeholder="Qty"
          className="form-control"
          min="1"
          value={item.qty}
          onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 1)}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Unit Price</label>
        <input
          type="number"
          placeholder="Price"
          className="form-control"
          min="0"
          step="0.01"
          value={item.price}
          onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-md-2">
        <label className="form-label d-none d-md-block">&nbsp;</label>
        <button
          className="btn btn-danger w-100"
          onClick={() => handleRemoveItem(index)}
        >
          <FaTrashAlt /> Remove
        </button>
      </div>
    </div>
  ))}

  <div className="button-group mt-4 d-flex justify-content-between">
    <button className="btn btn-primary btn-lg" onClick={handleAddItem}>
      <i className="bi bi-plus-circle me-2"></i> Add Item
    </button>
    <button className="btn btn-success btn-lg" onClick={downloadPDF}>
      <i className="bi bi-file-earmark-arrow-down me-2"></i> Download as PDF
    </button>
  </div>
</div>

  );
};

export default InvoiceGenerator;
