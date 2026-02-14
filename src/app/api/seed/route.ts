import { db } from '@/db';
import { stores, users } from '@/db/schema';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        // 1. Create Default Store
        const [store] = await db.insert(stores).values({
            name: 'Loja Matriz',
            slug: 'matriz'
        }).returning();

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash('123456', 10);

        // 3. Create Admin User
        const [user] = await db.insert(users).values({
            name: 'Admin',
            email: 'admin@loja.com',
            password: hashedPassword,
            role: 'ADMIN',
            storeId: store.id
        }).returning();

        return NextResponse.json({ message: 'Seed sucessful', store, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
