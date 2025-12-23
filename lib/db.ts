import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'licenses.json');

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

function ensureDb() {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    }
}

export function getLicenses(): License[] {
    ensureDb();
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function saveLicense(license: License) {
    ensureDb();
    const licenses = getLicenses();
    // Check if exists
    const idx = licenses.findIndex(l => l.id === license.id);
    if (idx >= 0) {
        licenses[idx] = license;
    } else {
        licenses.unshift(license);
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(licenses, null, 2));
}

export function deleteLicense(id: string) {
    ensureDb();
    let licenses = getLicenses();
    licenses = licenses.filter(l => l.id !== id);
    fs.writeFileSync(DB_PATH, JSON.stringify(licenses, null, 2));
}
