'use client';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export default function HistoryPage() {
  const [user, setUser] = useState('');
  const [bills, setBills] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchBills = async () => {
    const res = await fetch('/admin/api/bills');
    const allBills = await res.json();
    const userBills = allBills.filter((b) => b.user.toLowerCase() === user.toLowerCase());
    setBills(userBills);
    setFiltered(userBills);
    setShowConfirm(false);
  };

  const filterBills = () => {
    let result = [...bills];
    if (search) {
      result = result.filter((b) => b.phoneNo.includes(search));
    }
    if (date) {
      result = result.filter((b) => new Date(b.createdAt).toISOString().slice(0, 10) === date);
    }
    setFiltered(result);
  };

  const getTotal = (list) => list.reduce((sum, b) => sum + b.totalAmount, 0);

  const getMonthYearTotal = (type) => {
    const now = new Date();
    return filtered
      .filter((b) => {
        const billDate = new Date(b.createdAt);
        if (type === 'month') {
          return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
        }
        if (type === 'year') {
          return billDate.getFullYear() === now.getFullYear();
        }
        return false;
      })
      .reduce((sum, b) => sum + b.totalAmount, 0);
  };

  const exportExcel = () => {
    const formatted = filtered.flatMap((bill) => {
      const date = new Date(bill.createdAt);
      return bill.items.map((item) => ({
        User: bill.user,
        'House No': bill.houseNo,
        'Phone No': bill.phoneNo,
        Product: item.productName,
        Quantity: item.qty,
        'Item Total (₹)': `₹ ${item.qty * item.price}`,
        'Bill Total (₹)': `₹ ${bill.totalAmount}`,
        Date: date.toLocaleDateString('en-IN'),
        Time: date.toLocaleTimeString('en-IN'),
      }));
    });

    const ws = XLSX.utils.json_to_sheet(formatted);
    ws['!cols'] = [
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 20 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bills');
    XLSX.writeFile(wb, `billing_history_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  useEffect(() => {
    if (user) fetchBills();
  }, [user]);

  useEffect(() => {
    filterBills();
  }, [search, date]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Your Billing History</h2>

      <input
        className="border p-2 w-full"
        placeholder="Enter your name"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
      >
        Load Bills
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow max-w-sm text-center">
            <p>Load bills for <strong>{user}</strong>?</p>
            <div className="mt-4 space-x-3">
              <button
                onClick={fetchBills}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <input
          className="border p-2 flex-1"
          placeholder="Search by Phone No"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {filtered.length === 0 && <p className="text-gray-500">No bills found.</p>}

      {filtered.length > 0 && (
        <>
          <ul className="mt-4 space-y-3">
            {filtered.map((bill, idx) => (
              <li key={idx} className="border p-3 rounded shadow">
                <p>🏠 {bill.houseNo} | 📞 {bill.phoneNo}</p>
                <p>🕒 {new Date(bill.createdAt).toLocaleString()}</p>
                <p className="font-bold">₹ {bill.totalAmount}</p>
                <a
                  href={`https://wa.me/${bill.phoneNo}?text=Hi! Your bill on ${new Date(
                    bill.createdAt
                  ).toLocaleDateString()} is ₹${bill.totalAmount}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline text-sm"
                >
                  Send via WhatsApp
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 text-right font-semibold">
            <p>Total: ₹ {getTotal(filtered).toLocaleString()}</p>
            <p>Monthly Total: ₹ {getMonthYearTotal('month').toLocaleString()}</p>
            <p>Yearly Total: ₹ {getMonthYearTotal('year').toLocaleString()}</p>
          </div>

          <div className="text-right mt-4">
            <button
              onClick={exportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Export to Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
