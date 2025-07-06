// app/billing/api/generate/route.js
import { connectToDB } from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function POST(req) {
  await connectToDB();

  const { user, houseNo, phoneNo, items, totalAmount } = await req.json();

  if (!user || !houseNo || !phoneNo || !items || !totalAmount) {
    return Response.json({ message: 'Missing fields' }, { status: 400 });
  }

  const newBill = await Bill.create({
    user,
    houseNo,
    phoneNo,
    items,
    totalAmount,
  });

  return Response.json({ message: '✅ Bill saved successfully', billId: newBill._id });
}
