'use client';
import { useEffect, useState } from 'react';

export default function SendBillsPage() {
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('filteredBills');
    const bills = stored ? JSON.parse(stored) : [];

    const groupedBills = {};

    bills.forEach((bill) => {
      const key = bill.phoneNo || 'unknown';

      if (!groupedBills[key]) {
        groupedBills[key] = {
          user: bill.user,
          phoneNo: bill.phoneNo,
          houseNo: bill.houseNo,
          total: 0,
          products: {}, // <-- 👈 store products by name with qty
        };
      }

      groupedBills[key].total += bill.totalAmount;

      bill.items?.forEach((item) => {
        const name = item.productName;
        const qty = item.qty;
        if (groupedBills[key].products[name]) {
          groupedBills[key].products[name] += qty;
        } else {
          groupedBills[key].products[name] = qty;
        }
      });
    });

    setGrouped(groupedBills);
  }, []);
const handleSendWhatsApp = ({ user, phoneNo, total, products }) => {
    const monthName = new Date().toLocaleString('default', { month: 'long' });

    const productLines = Object.entries(products)
      .map(([name, qty]) => `${name} x${qty}`)
      .join(', ');

    const message =
      `Hello ${user}, your total bill for ${monthName} is ₹${total}.\n\n` +
      `Products: ${productLines}\n\n` +
      `Thank you - Anadi Industries LLP`;

    const url = `https://wa.me/91${phoneNo}?text=${encodeURIComponent(message)}`;

    // ✅ Use location.href for better mobile support
    window.location.href = url;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📤 Send Filtered Bills via WhatsApp</h2>

      <div className="grid gap-4">
        {Object.values(grouped).map((entry, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="mb-2 sm:mb-0">
              <p><strong>🏠 House:</strong> {entry.houseNo}</p>
              <p><strong>👤 Name:</strong> {entry.user}</p>
              <p><strong>📞 Phone:</strong> {entry.phoneNo}</p>
              <p><strong>💵 Total:</strong> ₹{entry.total}</p>
              <p className="mt-2 text-sm text-gray-700">
                <strong>🛒 Products:</strong>{' '}
                {Object.entries(entry.products)
                  .map(([name, qty]) => `${name} x${qty}`)
                  .join(', ')}
              </p>
            </div>

            <button
              onClick={() => handleSendWhatsApp(entry)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Send via WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
