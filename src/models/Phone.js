// models/Phone.js
import mongoose from 'mongoose';

const phoneSchema = new mongoose.Schema({
  houseNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true,
  }
});

export default mongoose.models.Phone || mongoose.model('Phone', phoneSchema);
