import { connectToDB } from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function DELETE(req, context) {
  try {
    await connectToDB();

    const { id } = await context.params; // ✅ await params

    const deletedBill = await Bill.findByIdAndDelete(id);

    if (!deletedBill) {
      return Response.json({ error: 'Bill not found' }, { status: 404 });
    }

    return Response.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to delete bill' }, { status: 500 });
  }
}
