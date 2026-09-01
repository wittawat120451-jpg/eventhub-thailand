/**
 * ==============================================================================
 * ไฟล์: src/utils/supabaseClient.js
 * หน้าที่: กำหนดค่าการเชื่อมต่อฐานข้อมูล Supabase Cloud Database
 * คำอธิบายสำหรับนักเรียน:
 *   - createClient รับค่า SUPABASE_URL และ SUPABASE_ANON_KEY เพื่อเชื่อมต่อกับ Cloud
 * ==============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// ค่าการเชื่อมต่อ Supabase ที่ผู้ใช้ระบุ
export const SUPABASE_URL = 'https://wtqkvomoxqbizsguqdkc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cWt2b21veHFiaXpzZ3VxZGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjU1NTcsImV4cCI6MjEwMzgwMTU1N30.9L3V2EGhvwwmNcu90zkczCQHuOw-ThM0VrG6TPM60ik';

// สร้าง Supabase Client instance สำหรับใช้งานในโปรเจกต์
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
