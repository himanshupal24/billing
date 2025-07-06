'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleAdminLogin = () => {
    const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN;

    if (pin === ADMIN_PIN) {
      const popup = document.getElementById('celebration');
      popup.style.display = 'flex';

      const duration = 2000;
      const animationEnd = Date.now() + duration;

      const confetti = require('canvas-confetti').default;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          router.push('/admin');
          return;
        }
        confetti({
          ...defaults,
          particleCount: 50 * (timeLeft / duration),
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
      }, 200);
    } else {
      alert('❌ Incorrect PIN. Please try again.');
    }
  };

  const handleBillingLogin = () => {
    if (!name.trim()) return alert('Please enter your name to continue.');
    localStorage.setItem('currentUser', name);
    router.push(`/billing?user=${encodeURIComponent(name)}`);
  };

  return (
   <div className="min-h-screen px-4 py-10 flex flex-col items-center gap-10 bg-gray-100">
  <canvas id="confetti-canvas"></canvas>

  {/* <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
    Welcome to <span className="text-blue-600">Anadi Industries LLP</span>
  </h1> */}

  <div className="w-full flex flex-col lg:flex-row gap-8 justify-center items-center">
    {/* Billing Access Card */}
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">👤 Billing Access</h2>
      <input
        type="text"
        placeholder="Enter Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-3 rounded-md"
      />
      <button
        onClick={handleBillingLogin}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 w-full rounded-md"
      >
        Continue to Billing
      </button>
    </div>

    {/* Admin Access Card */}
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">🔐 Admin Access</h2>
      <input
        type="password"
        placeholder="Enter Admin PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="border p-2 w-full mb-3 rounded-md"
      />
      <button
        onClick={handleAdminLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full rounded-md"
      >
        Login as Admin
      </button>
    </div>
  </div>

  {/* Confetti Celebration */}
  <div
    id="celebration"
    className="hidden fixed inset-0 bg-white bg-opacity-90 flex-col justify-center items-center text-center z-50"
  >
    <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-relaxed">
      🎉 Welcome to <br />
      <span className="text-blue-600">Anadi Industries LLP</span> <br />
      (Admin Panel) <br />
      Dr. Pranav Shukla ji 🎊
    </h1>
  </div>
</div>

  );
}
