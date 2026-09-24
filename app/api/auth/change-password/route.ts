// app/api/auth/change-password/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const identifier = String(body.username ?? body.email ?? '').trim();
        const last4Digits = String(body.last4Digits ?? '').trim();
        const password = String(body.password ?? '');
        const confirmPassword = String(body.confirmPassword ?? '');

        // 1. ตรวจสอบความครบถ้วนของข้อมูล
        if (!identifier || !last4Digits || !password || !confirmPassword) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
                { status: 400 }
            );
        }

        if (last4Digits.length !== 4 || !/^\d{4}$/.test(last4Digits)) {
            return NextResponse.json(
                { error: 'กรุณากรอกเลขท้ายเบอร์โทรศัพท์ให้เป็นตัวเลข 4 หลัก' },
                { status: 400 }
            );
        }

        // 2. ค้นหาผู้ใช้จากตาราง public.users (รองรับทั้ง username หรือ email)
        const { data: userProfile, error: queryErr } = await supabaseAdmin
            .from('users')
            .select('user_id, username, email, phone, password_hash')
            .or(`username.ilike.${identifier},email.ilike.${identifier}`)
            .maybeSingle();

        if (queryErr) {
            console.error('[DB Query Error]:', queryErr);
            return NextResponse.json(
                { error: 'เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล' },
                { status: 500 }
            );
        }

        if (!userProfile) {
            return NextResponse.json(
                { error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' },
                { status: 404 }
            );
        }

        // 3. ตรวจสอบเลข 4 ตัวท้ายของเบอร์โทรศัพท์ที่บันทึกไว้
        const storedPhone = (userProfile.phone || '').replace(/[^0-9]/g, '');

        if (!storedPhone || storedPhone.slice(-4) !== last4Digits) {
            return NextResponse.json(
                { error: 'เลข 4 ตัวท้ายไม่ตรงกับเบอร์โทรศัพท์ที่เคยลงทะเบียนไว้' },
                { status: 400 }
            );
        }

        // 4. ตรวจสอบว่ารหัสผ่านใหม่ซ้ำกับรหัสผ่านเดิมหรือไม่
        if (userProfile.password_hash) {
            const isSamePassword = await bcrypt.compare(password, userProfile.password_hash);
            if (isSamePassword) {
                return NextResponse.json(
                    { error: 'กรุณาตั้งรหัสผ่านใหม่ที่แตกต่างจากรหัสผ่านเดิม' },
                    { status: 400 }
                );
            }
        }

        // 5. Hash รหัสผ่านใหม่ด้วย bcrypt
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(password, saltRounds);

        // 6. อัปเดต password_hash ใหม่ลงในตาราง users
        const { error: updateErr } = await supabaseAdmin
            .from('users')
            .update({ password_hash: newPasswordHash })
            .eq('user_id', userProfile.user_id);

        if (updateErr) {
            console.error('[DB Update Error]:', updateErr);
            return NextResponse.json(
                { error: 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว' },
            { status: 200 }
        );
    } catch (err) {
        console.error('[Server Error]:', err);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
            { status: 500 }
        );
    }
}