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
          products: {}, // store qty & rate
        };
      }

      groupedBills[key].total += bill.totalAmount;

      bill.items?.forEach((item) => {
        const name = item.productName;
        const qty = item.qty;
        const rate = item.price;

        if (groupedBills[key].products[name]) {
          groupedBills[key].products[name].qty += qty;
        } else {
          groupedBills[key].products[name] = { qty, rate };
        }
      });
    });

    setGrouped(groupedBills);
  }, []);

  const handleSendWhatsApp = ({ user, phoneNo, houseNo, total, products }) => {
    const monthName = new Date().toLocaleString('default', { month: 'long' });

    const productLines = Object.entries(products)
      .map(
        ([name, { qty, rate }]) =>
          `${name} - ${qty} x ₹${rate} = ₹${qty * rate}`
      )
      .join('\n');

    const message =
      `Anadi industries LLP\n\n` +
      `Customer Address/ No - ${houseNo}\n` +
      `Mobile No - ${phoneNo}\n` +
      `Delivered by - ${user}\n` +
      `Products:\n${productLines}\n\n` +
      `Total Bill - ₹${total}\n`;
    // `(Billing Month: ${monthName-1})`

    // ✅ Ensure only digits for phone number
    let cleanPhone = phoneNo.replace(/\D/g, '');

    // ✅ Add country code if missing (default India = 91)
    if (!cleanPhone.startsWith("91")) {
      cleanPhone = "91" + cleanPhone;
    }

    // ✅ Correct wa.me link
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.location.href = url; // works for Android & iOS
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        📤 Send Filtered Bills via WhatsApp
      </h2>

      <div className="grid gap-4">
        {Object.values(grouped).map((entry, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="mb-2 sm:mb-0">
              <p>
                <strong>👤 Customer Address:</strong> {entry.houseNo}
              </p>
              <p>
                <strong>📞 Phone:</strong> {entry.phoneNo}
              </p>
              <p>
                <strong>🧑‍💼 Delivered by:</strong> {entry.user}
              </p>
              <p>
                <strong>💵 Total:</strong> ₹{entry.total}
              </p>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                <strong>🛒 Products:</strong>
                {'\n'}
                {Object.entries(entry.products)
                  .map(
                    ([name, { qty, rate }]) =>
                      `${name} - ${qty} x ₹${rate} = ₹${qty * rate}`
                  )
                  .join('\n')}
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
