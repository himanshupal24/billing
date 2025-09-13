'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();

  const [user, setUser] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [product, setProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [items, setItems] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [houses, setHouses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(storedUser);

    fetch('/admin/api/products')
      .then(res => res.json())
      .then(data => setProductsList(data));

    fetch('/admin/api/phones')
      .then(res => res.json())
      .then(data => setHouses(data));
  }, []);

  const handleAddItem = () => {
    if (!product || qty <= 0 || price <= 0) return;
    setItems([...items, { productName: product, qty, price }]);
    setProduct('');
    setQty(1);
    setPrice(0);
  };

  const handleGenerateBill = async () => {
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const date = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const billLines = items.map(i =>
    `${i.productName} - ₹${i.price} x ${i.qty} = ₹${i.price * i.qty}`
  ).join('\n');

  const message =
    `Anadi Industries LLP\n\n` +
    `House No: ${houseNo}\n` +
    `Phone: ${phoneNo}\n` +
    `Date: ${date}\n\n` +
    `Bill Details:\n${billLines}\n\n` +
    `Grand Total: ₹${total}\n\n` +
    `Health isn't a goal — it's a lifestyle`;

  const res = await fetch('/billing/api/generate', {
    method: 'POST',
    body: JSON.stringify({ user, houseNo, phoneNo, items, totalAmount: total }),
  });

  const data = await res.json();

  if (res.ok) {
    const whatsappURL = `https://wa.me/91${phoneNo}?text=${encodeURIComponent(message)}`;

    // ✅ Clear everything EXCEPT user
    setHouseNo('');
    setPhoneNo('');
    setItems([]);
    setProduct('');
    setQty(1);
    setPrice(0);

    // ✅ Keep user saved in localStorage
    localStorage.setItem('currentUser', user);

    // ✅ Redirect to WhatsApp
    window.location.href = whatsappURL;
  }

  alert(data.message);
};







  const handleHouseSelect = (val) => {
    setHouseNo(val);
    const phone = houses.find(h => h.houseNo === val);
    setPhoneNo(phone?.phoneNo || '');
  };

  const handleConfirmBill = () => setShowModal(true);
  const confirmAndSend = () => {
    setShowModal(false);
    handleGenerateBill();
  };
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-800">🧾 Billing Page</h1>
        <button
          onClick={() => router.push('/billing/history')}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          📜 Go to History
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white shadow rounded p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Customer Info</h2>

        <input
          className="border p-2 w-full rounded"
          placeholder="Enter your name"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <select
          className="border p-2 w-full rounded"
          value={houseNo}
          onChange={(e) => handleHouseSelect(e.target.value)}
        >
          <option value="">🏠 Select House No</option>
          {houses.map((h) => (
            <option key={h.houseNo} value={h.houseNo}>{h.houseNo}</option>
          ))}
        </select>

        <input
          className="border p-2 w-full rounded bg-gray-100"
          placeholder="Phone No"
          value={phoneNo}
          disabled
        />
      </div>

      {/* Product Entry */}
      <div className="bg-white shadow rounded p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Add Products</h2>

        <div className="flex flex-wrap gap-2">
          <select
            className="border p-2 flex-1 rounded"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value="">🧃 Select Product</option>
            {productsList.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>

          <input
            type="number"
            className="border p-2 w-20 rounded"
            placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />

          <input
            type="number"
            className="border p-2 w-24 rounded"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            ➕ Add
          </button>
        </div>

        <ul className="text-sm space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span>
                🛒 {item.productName} - ₹{item.price} x {item.qty} = ₹{item.price * item.qty}
              </span>
              <button
                onClick={() => handleRemoveItem(idx)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                ❌ Cancel
              </button>
            </li>
          ))}
        </ul>


        <p className="font-bold text-xl text-right">
          Grand Total: ₹{items.reduce((sum, i) => sum + i.qty * i.price, 0)}
        </p>

        <button
          onClick={handleConfirmBill}
          className="w-full bg-green-600 text-white px-4 py-3 rounded text-lg font-semibold hover:bg-green-500"
        >
          ✅ Generate & Send Bill
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg space-y-4 max-w-md w-full shadow-lg">
            <p className="text-lg font-semibold">Are you sure you want to generate and send this bill?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="text-gray-700 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={confirmAndSend} className="bg-green-600 text-white px-4 py-2 rounded">
                Yes, Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
