import { connectToDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await connectToDB();
  const { name, defaultPrice } = await req.json();

  if (!name || defaultPrice == null) {
    return NextResponse.json({ message: 'All fields required' }, { status: 400 });
  }

  await Product.findOneAndUpdate(
    { name },
    { name, defaultPrice },
    { upsert: true, new: true }
  );

  return NextResponse.json({ message: 'Product saved' });
}

export async function GET() {
  await connectToDB();
  const products = await Product.find({});
  return NextResponse.json(products);
}

// ✅ NEW: DELETE function
export async function DELETE(req) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ message: 'Product name is required' }, { status: 400 });
  }

  await Product.deleteOne({ name });

  return NextResponse.json({ message: 'Product deleted successfully' });
}
