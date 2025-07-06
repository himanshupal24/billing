// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  defaultPrice: {
    type: Number,
    required: true,
    default: 0,
  }
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
