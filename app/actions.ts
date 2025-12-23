"use server";

import { generateLicenseKey } from "@/lib/crypto-utils";
import { getLicenses, saveLicense, deleteLicense as removeLicense, License } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function fetchLicenses() {
    return await getLicenses();
}

export async function removeLicenseAction(id: string) {
    await removeLicense(id);
    revalidatePath('/');
    return { success: true };
}

export async function toggleBlockAction(id: string) {
    const licenses = await getLicenses();
    const license = licenses.find(l => l.id === id);
    if (license) {
        // Toggle Logic
        if (license.status === 'Blocked') {
            // Restore to Active (or Expired if date passed)
            const today = new Date().toISOString().split('T')[0].replace(/-/g, "");
            const exp = license.expiry.replace(/-/g, "");
            license.status = parseInt(today) > parseInt(exp) ? 'Expired' : 'Active';
        } else {
            license.status = 'Blocked';
        }
        await saveLicense(license);
        revalidatePath('/');
        return { success: true, status: license.status };
    }
    return { success: false };
}

export async function createLicense(formData: FormData) {
    try {
        const hwid = formData.get("hwid") as string;
        const days = parseInt(formData.get("days") as string || "365");
        const name = formData.get("name") as string;
        const mobile = formData.get("mobile") as string;
        const email = formData.get("email") as string;
        const country = formData.get("country") as string;

        const date = new Date();
        date.setDate(date.getDate() + days);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const expDate = `${yyyy}${mm}${dd}`; // For Key Generation
        const displayExpDate = `${yyyy}-${mm}-${dd}`;

        const key = generateLicenseKey(hwid, expDate);

        // Save to DB
        const newLicense: License = {
            id: Math.random().toString(36).substring(2, 9),
            name,
            mobile,
            email,
            country,
            hwid,
            key,
            expiry: displayExpDate,
            status: 'Active',
            created: new Date().toISOString().split('T')[0]
        };

        await saveLicense(newLicense);
        revalidatePath('/');

        return { success: true, key, expDate: displayExpDate, license: newLicense };
    } catch (e: any) {
        console.error("Create License Error:", e);
        return { success: false, error: e.message || "Unknown Server Error" };
    }
}

import { cookies } from 'next/headers';

export async function login(email: string, pass: string) {
    if (email === "omarali2022rx@gmai.com" && pass === "012823513rX") {
        cookies().set('admin_session', 'valid_secure_session', {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 Week
        });
        return { success: true };
    }
    return { success: false };
}

export async function logout() {
    cookies().delete('admin_session');
}
