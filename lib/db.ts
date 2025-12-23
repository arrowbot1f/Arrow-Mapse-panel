import connectDB from './mongodb';
import LicenseModel from './models/License';

export interface License {
    id: string;
    name: string;
    mobile: string;
    email: string;
    country: string;
    hwid: string;
    key: string;
    expiry: string;
    status: 'Active' | 'Expired' | 'Blocked';
    created: string;
}

// Convert Mongoose doc to License interface
function mapDoc(doc: any): License {
    return {
        id: doc.id,
        name: doc.name,
        mobile: doc.mobile,
        email: doc.email,
        country: doc.country,
        hwid: doc.hwid,
        key: doc.key,
        expiry: doc.expiry,
        status: doc.status,
        created: doc.created
    };
}

export async function getLicenses(): Promise<License[]> {
    await connectDB();
    const docs = await LicenseModel.find({}).sort({ createdAt: -1 });
    return docs.map(mapDoc);
}

export async function saveLicense(license: License) {
    await connectDB();
    // Upsert based on ID
    await LicenseModel.findOneAndUpdate(
        { id: license.id },
        license,
        { upsert: true, new: true }
    );
}

export async function deleteLicense(id: string) {
    await connectDB();
    await LicenseModel.deleteOne({ id });
}

