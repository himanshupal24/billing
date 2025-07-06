// models/Bill.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
}, { _id: false });

const billSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  houseNo: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  items: [itemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Bill || mongoose.model('Bill', billSchema);
