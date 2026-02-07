import { useState, useEffect, useCallback } from 'react';
import { supabase, Memo } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { MemoList } from './components/MemoList';
import { MemoInput } from './components/MemoInput';
import { BackupPage } from './components/BackupPage';
import type { User } from '@supabase/supabase-js';

const PAGE_SIZE = 50;

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showBackup, setShowBackup] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            loadMemos();
        } else {
            setMemos([]);
            setHasMore(true);
        }
    }, [user]);

    const loadMemos = async () => {
        const { data, error } = await supabase
            .from('memos')
            .select('*')
            .order('created_at', { ascending: false })
            .range(0, PAGE_SIZE - 1);

        if (!error && data) {
            setMemos(data.reverse());
            setHasMore(data.length === PAGE_SIZE);
        }
    };

    const loadMoreMemos = useCallback(async () => {
        if (loadingMore || !hasMore || memos.length === 0) return;

        setLoadingMore(true);
        const oldestMemo = memos[0];

        const { data, error } = await supabase
            .from('memos')
            .select('*')
            .lt('created_at', oldestMemo.created_at)
            .order('created_at', { ascending: false })
            .range(0, PAGE_SIZE - 1);

        if (!error && data) {
            setMemos((prev) => [...data.reverse(), ...prev]);
            setHasMore(data.length === PAGE_SIZE);
        }
        setLoadingMore(false);
    }, [loadingMore, hasMore, memos]);

    const addMemo = async (content: string) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('memos')
            .insert([{ content, user_id: user.id }])
            .select()
            .single();

        if (!error && data) {
            setMemos((prev) => [...prev, data]);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="app-container">
                <div className="loading">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="header">
                <h1>📝 메모장</h1>
                {user && (
                    <div className="user-info">
                        <button
                            className="btn-settings"
                            onClick={() => setShowBackup(!showBackup)}
                            title="백업"
                        >
                            ⚙️
                        </button>
                        <span className="user-email">{user.email}</span>
                        <button className="btn-logout" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                )}
            </header>

            {!user ? (
                <AuthForm />
            ) : showBackup ? (
                <BackupPage onBack={() => setShowBackup(false)} />
            ) : (
                <main className="memo-container">
                    <MemoList
                        memos={memos}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                        onLoadMore={loadMoreMemos}
                    />
                    <MemoInput onSubmit={addMemo} />
                </main>
            )}
        </div>
    );
}
