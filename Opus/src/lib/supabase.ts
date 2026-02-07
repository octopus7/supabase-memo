import { createClient } from '@supabase/supabase-js';

// TODO: 본인의 Supabase 프로젝트 정보로 교체하세요
// SUPABASE_SETUP.md 참고
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Memo {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
}
