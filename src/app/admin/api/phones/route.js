import { connectToDB } from '@/lib/mongodb';
import Phone from '@/models/Phone';
import { NextResponse } from 'next/server';

// POST: Add or update phone info
export async function POST(req) {
  await connectToDB();
  const { houseNo, phoneNo } = await req.json();

  if (!houseNo || !phoneNo) {
    return NextResponse.json({ message: 'House number and phone number are required' }, { status: 400 });
  }

  await Phone.findOneAndUpdate(
    { houseNo },
    { phoneNo },
    { upsert: true, new: true }
  );

  return NextResponse.json({ message: 'Phone saved successfully' });
}

// GET: Fetch all phones
export async function GET() {
  await connectToDB();
  const phones = await Phone.find({});
  return NextResponse.json(phones);
}

// DELETE: Delete phone by houseNo from query string
export async function DELETE(req) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const houseNo = searchParams.get('houseNo');

  if (!houseNo) {
    return NextResponse.json({ message: 'House number is required' }, { status: 400 });
  }

  await Phone.deleteOne({ houseNo });

  return NextResponse.json({ message: 'Phone deleted successfully' });
}
