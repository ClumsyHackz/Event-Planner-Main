const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: String, enum: ['Academic', 'Sports', 'Cultural', 'Technology', 'Other'], default: 'Other' },
  venue: { type: String, required: true, trim: true },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date },
  capacity: { type: Number, required: true, min: 1 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
  rejectionReason: String
}, { timestamps: true });
module.exports = mongoose.model('Event', eventSchema);
