import { NextResponse } from 'next/server';
import { getLicenses } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { key, hwid } = body;

        if (!key || !hwid) {
            return NextResponse.json({ valid: false, message: "Missing Data" });
        }

        const licenses = await getLicenses();
        const license = licenses.find(l => l.key === key);

        if (!license) {
            return NextResponse.json({ valid: false, message: "License Not Found" });
        }

        if (license.status === 'Blocked') {
            return NextResponse.json({ valid: false, message: "License Blocked by Admin" });
        }

        // 1. Check HWID
        if (license.hwid !== hwid) {
            return NextResponse.json({ valid: false, message: "HWID Mismatch" });
        }

        // 2. Check Expiry
        const today = new Date().toISOString().split('T')[0].replace(/-/g, ""); // YYYYMMDD
        const expDate = license.expiry.replace(/-/g, ""); // YYYYMMDD (from YYYY-MM-DD stored)

        if (parseInt(today) > parseInt(expDate)) {
            return NextResponse.json({ valid: false, message: "License Expired" });
        }

        return NextResponse.json({
            valid: true,
            expiry: license.expiry,
            daysLeft: Math.floor((new Date(license.expiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        });

    } catch (e) {
        return NextResponse.json({ valid: false, message: "Server Error" });
    }
}
