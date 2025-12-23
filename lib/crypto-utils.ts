import crypto from 'crypto';

// MUST MATCH C# Secret
// MUST MATCH C# Secret
const SECRET_KEY = process.env.SECRET_KEY || "ArrowMapse_Secret_2025_Secure_Key_!@#";

export function generateLicenseKey(hwid: string, expirationDate: string): string {
    // 1. Clean HWID (Remove dashes)
    const cleanHwid = hwid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // 2. Prepare Payload: HWID + Date
    // Date is YYYYMMDD
    const payload = cleanHwid + expirationDate;

    // 3. Sign: SHA256(Payload + Secret)
    const hash = crypto.createHash('sha256').update(payload + SECRET_KEY).digest('hex').toUpperCase();

    // 4. Truncate Signature to 8 chars
    const shortSig = hash.substring(0, 8);

    // 5. Format: YYYYMMDD-SIG
    return `${expirationDate}-${shortSig}`;
}
