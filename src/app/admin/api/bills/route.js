import { connectToDB } from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function GET() {
  await connectToDB();
  const bills = await Bill.find().sort({ createdAt: -1 });
  return Response.json(bills);
}

export async function DELETE(req) {
  await connectToDB();
  const { user } = await req.json();

  if (user) {
    await Bill.deleteMany({ user });
    return Response.json({ message: `Deleted bills for user: ${user}` });
  }

  await Bill.deleteMany({});
  return Response.json({ message: 'All bills deleted' });
}
