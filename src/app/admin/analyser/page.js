'use client';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
export default function AdminAnalyser() {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
const router = useRouter();

    useEffect(() => {
        fetch('/admin/api/bills')
            .then((res) => res.json())
            .then((data) => {
                setBills(data);
                setFilteredBills(data);
            });
    }, []);

    // Group by lowercase name, but store/display original version
    const userMap = new Map();

    bills.forEach((bill) => {
        const cleanName = bill.user.trim().toLowerCase();
        if (!userMap.has(cleanName)) {
            userMap.set(cleanName, bill.user); // Store the original
        }
    });

    const users = Array.from(userMap.values());


    const filterBills = () => {
        let result = bills;

        if (selectedUser) {
            result = result.filter((b) =>
                b.user.trim().toLowerCase() === selectedUser.trim().toLowerCase()
            );
        }

        if (searchPhone) {
            result = result.filter((b) => b.phoneNo.includes(searchPhone));
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the full end day

            result = result.filter((b) => {
                const billDate = new Date(b.createdAt);
                return billDate >= start && billDate <= end;
            });
        }


        setFilteredBills(result);
    };

    useEffect(() => {
        filterBills();
    }, [selectedUser, searchPhone, startDate, endDate]);


    const exportToExcel = () => {
        // Step 1: Build monthly total map for the selected user
        const monthlyTotals = {};

        filteredBills.forEach((bill) => {
            const date = new Date(bill.createdAt);
            const monthKey = `${bill.user}_${date.getFullYear()}-${date.getMonth() + 1}`; // e.g. "John_2025-7"
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += bill.totalAmount;
        });

        // Step 2: Format data with Monthly Total column
        const formattedData = filteredBills.flatMap((bill) => {
            const date = new Date(bill.createdAt);
            const monthKey = `${bill.user}_${date.getFullYear()}-${date.getMonth() + 1}`;
            const monthlyTotal = monthlyTotals[monthKey] || 0;

            return bill.items.map((item) => ({
                User: bill.user,
                'House No': bill.houseNo,
                'Phone No': bill.phoneNo,
                Product: item.productName,
                Quantity: item.qty,
                'Total Amount (₹)': `₹ ${item.price * item.qty}`,
                'Monthly Total (₹)': `₹ ${monthlyTotal}`,
                Date: date.toLocaleDateString('en-IN'),
                Time: date.toLocaleTimeString('en-IN'),
            }));
        });

        const ws = XLSX.utils.json_to_sheet(formattedData);

        // Optional: Set column widths
        const wscols = [
            { wch: 20 }, // User
            { wch: 12 }, // House No
            { wch: 15 }, // Phone No
            { wch: 15 }, // Product
            { wch: 10 }, // Quantity
            { wch: 18 }, // Total
            { wch: 18 }, // Monthly Total
            { wch: 15 }, // Date
            { wch: 12 }, // Time
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Filtered Bills');
        XLSX.writeFile(wb, `Bill_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const getTotals = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let allTime = 0;
        let monthTotal = 0;
        let yearTotal = 0;

        filteredBills.forEach((bill) => {
            const date = new Date(bill.createdAt);
            const amt = bill.totalAmount;

            allTime += amt;

            if (date.getFullYear() === currentYear) {
                yearTotal += amt;
                if (date.getMonth() === currentMonth) {
                    monthTotal += amt;
                }
            }
        });

        return { allTime, monthTotal, yearTotal };
    };

    const { allTime, monthTotal, yearTotal } = getTotals();
    const deleteBills = async () => {
        const confirmed = window.confirm(
            selectedUser
                ? `Are you sure you want to delete all bills for user "${selectedUser}"?`
                : 'Are you sure you want to delete ALL bills?'
        );

        if (!confirmed) return;

        const res = await fetch('/admin/api/bills', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedUser ? { user: selectedUser } : {}),
        });

        if (res.ok) {
            const updated = await fetch('/admin/api/bills').then((r) => r.json());
            setBills(updated);
            setFilteredBills(updated);
            alert('✅ Deleted successfully');
        } else {
            alert('❌ Failed to delete bills');
        }
    };


    const generateWhatsAppMessages = () => {
        const grouped = {};

        filteredBills.forEach((bill) => {
            const key = bill.phoneNo;
            if (!grouped[key]) {
                grouped[key] = {
                    user: bill.user,
                    phoneNo: bill.phoneNo,
                    houseNo: bill.houseNo,
                    total: 0,
                };
            }
            grouped[key].total += bill.totalAmount;
        });

        const monthName = new Date().toLocaleString('default', { month: 'long' });

        return Object.values(grouped).map((entry) => {
            return `Hello ${entry.user}, your total bill for ${monthName} is ₹${entry.total}. Thank you!`;
        });
    };

   
const handleSendMessages = () => {
  localStorage.setItem('filteredBills', JSON.stringify(filteredBills));
  router.push('/admin/analyser/send-bills');
};

    return (
        <div className="p-4 sm:p-6 lg:p-10 bg-gray-50 min-h-screen">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
                Admin - Bill Analyser
            </h1>

            {/* User Filter & Export */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {users.map((u) => (
                    <button
                        key={u}
                        onClick={() => setSelectedUser(u)}
                        className={`px-4 py-2 rounded-md text-sm ${selectedUser === u
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                            }`}
                    >
                        {u}
                    </button>
                ))}

                <button
                    onClick={() => {
                        setSelectedUser('');
                        setSearchPhone('');
                        setSearchDate('');
                    }}
                    className="px-4 py-2 rounded-md text-sm bg-yellow-200 text-yellow-800"
                >
                    🔄 View All Bills
                </button>


                <button
                    onClick={exportToExcel}
                    className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                    📥 Export to Excel
                </button>
                <button
                    onClick={deleteBills}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                    🗑️ {selectedUser ? `Delete Bills for "${selectedUser}"` : 'Delete All Bills'}
                </button>

                <button
                    onClick={handleSendMessages}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                    📤 Send Bills
                </button>

            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600">📆 This Month</h3>
                    <p className="text-2xl font-bold text-blue-700">₹ {monthTotal}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600">📅 This Year</h3>
                    <p className="text-2xl font-bold text-green-700">₹ {yearTotal}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600">🧾 All Time</h3>
                    <p className="text-2xl font-bold text-gray-800">₹ {allTime}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <input
                    className="border border-gray-300 p-2 rounded-md w-full"
                    placeholder="🔍 Search by Phone No"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                />
                <div className="flex gap-4 flex-col sm:flex-row">
                    <input
                        type="date"
                        className="border border-gray-300 p-2 rounded-md w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        className="border border-gray-300 p-2 rounded-md w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                </div>

            </div>

            {/* Bill List */}
            <ul className="space-y-4">
                {filteredBills.map((bill, idx) => (
                    <li
                        key={idx}
                        className="border rounded-md bg-white p-4 shadow-sm text-sm sm:text-base"
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <p className="font-medium text-gray-700">
                                🧑 {bill.user} | 🏠 {bill.houseNo} | 📞 {bill.phoneNo}
                            </p>
                            <p className="text-gray-500 mt-2 sm:mt-0 text-xs sm:text-sm">
                                🕒 {new Date(bill.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <p className="font-bold text-lg text-green-700 mt-2">
                            ₹ {bill.totalAmount}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
