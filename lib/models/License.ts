
import mongoose, { Schema, model, models } from 'mongoose';

const LicenseSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mobile: { type: String, required: false },
    email: { type: String, required: false },
    country: { type: String, required: false },
    hwid: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    expiry: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Expired', 'Blocked'], default: 'Active' },
    created: { type: String, required: true }
}, { timestamps: true });

const License = models.License || model('License', LicenseSchema);

export default License;
