'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();

    // Form states
    const [houseNo, setHouseNo] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [productName, setProductName] = useState('');
    const [defaultPrice, setDefaultPrice] = useState('');

    // Existing data
    const [phones, setPhones] = useState([]);
    const [products, setProducts] = useState([]);

    // Fetch existing data
    useEffect(() => {
        fetch('/admin/api/phones')
            .then(res => res.json())
            .then(setPhones);

        fetch('/admin/api/products')
            .then(res => res.json())
            .then(setProducts);
    }, []);

    // Auto-fill phone based on houseNo
    const handleHouseSelect = (value, string) => {
        setHouseNo(value);
        const found = phones.find(p => p.houseNo === value);
        setPhoneNo(found?.phoneNo || '');
    };

    // Auto-fill price based on product
    const handleProductSelect = (value, string) => {
        setProductName(value);
        const found = products.find(p => p.name === value);
        setDefaultPrice(found?.defaultPrice?.toString() || '');
    };

    const handlePhoneSubmit = async () => {
        const res = await fetch('/admin/api/phones', {
            method: 'POST',
            body: JSON.stringify({ houseNo, phoneNo }),
        });
        const data = await res.json();
        alert(data.message);
    };

    const handleProductSubmit = async () => {
        const res = await fetch('/admin/api/products', {
            method: 'POST',
            body: JSON.stringify({ name: productName, defaultPrice }),
        });
        const data = await res.json();
        alert(data.message);
    };


    const handleDeletePhone = async (houseNo) => {
        if (!confirm(`Are you sure you want to delete phone for house ${houseNo}?`)) return;

        const res = await fetch(`/admin/api/phones?houseNo=${houseNo}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        alert(data.message);
        setPhones(prev => prev.filter(p => p.houseNo !== houseNo));
    };

    const handleDeleteProduct = async (name) => {
        if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

        const res = await fetch(`/admin/api/products?name=${encodeURIComponent(name)}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        alert(data.message);
        setProducts(prev => prev.filter(p => p.name !== name));
    };

    return (
        <div className="min-h-screen px-4 py-8 sm:px-8 md:px-16 lg:px-24 bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <button
                    onClick={() => router.push('/admin/analyser')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md shadow"
                >
                    📊 View Bill Analyser
                </button>
            </div>

            {/* Card: Phone Number */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">📞 Add / Update Phone Number</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="w-full">
                        <input
                            list="house-options"
                            className="border border-gray-300 rounded-md p-2 w-full"
                            placeholder="House No"
                            value={houseNo}
                            onChange={(e) => handleHouseSelect(e.target.value)}
                        />
                        <datalist id="house-options">
                            {phones.map((p) => (
                                <option key={p.houseNo} value={p.houseNo} />
                            ))}
                        </datalist>
                    </div>

                    <input
                        className="border border-gray-300 rounded-md p-2 w-full"
                        placeholder="Phone No"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                    />

                    <button
                        onClick={handlePhoneSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
                    >
                        Save Phone
                    </button>
                </div>
                {/* List of Saved House Numbers and Phones */}
                <div className="bg-white shadow rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">📋 Saved Houses & Phones</h3>
                    {phones.length === 0 ? (
                        <p className="text-gray-500">No phone entries yet.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {phones.map((p, idx) => (
                                <li key={idx} className="flex justify-between items-center border-b pb-1">
                                    <div>
                                        <span className="font-medium">🏠 {p.houseNo}</span> - <span>📞 {p.phoneNo}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePhone(p.houseNo)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        🗑️ Delete
                                    </button>
                                </li>
                            ))}

                        </ul>
                    )}
                </div>
            </div>

            {/* Card: Product */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">🛒 Add / Update Product</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="w-full">
                        <input
                            list="product-options"
                            className="border border-gray-300 rounded-md p-2 w-full"
                            placeholder="Product Name"
                            value={productName}
                            onChange={(e) => handleProductSelect(e.target.value)}
                        />
                        <datalist id="product-options">
                            {products.map((p) => (
                                <option key={p.name} value={p.name} />
                            ))}
                        </datalist>
                    </div>

                    <input
                        type="number"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        placeholder="Default Price"
                        value={defaultPrice}
                        onChange={(e) => setDefaultPrice(e.target.value)}
                    />

                    <button
                        onClick={handleProductSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
                    >
                        Save Product
                    </button>
                </div>
            </div>
            {/* List of Products */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">📦 Saved Products</h3>
                {products.length === 0 ? (
                    <p className="text-gray-500">No products added yet.</p>
                ) : (
                    <ul className="space-y-2 text-sm">
                        {products.map((p, idx) => (
                            <li key={idx} className="flex justify-between items-center border-b pb-1">
                                <div>
                                    <span className="font-medium">{p.name}</span> - <span>₹ {p.defaultPrice}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteProduct(p.name)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    🗑️ Delete
                                </button>
                            </li>
                        ))}

                    </ul>
                )}
            </div>

        </div>
    );
}
