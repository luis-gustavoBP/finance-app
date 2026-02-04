import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');

    if (token_hash && type) {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { error } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash,
        });

        if (!error) {
            // Success: redirect to login with confirmed param
            return NextResponse.redirect(`${requestUrl.origin}/login?confirmed=true`);
        }
    }

    // Error: redirect to login with error param
    return NextResponse.redirect(`${requestUrl.origin}/login?error=confirmation_failed`);
}
