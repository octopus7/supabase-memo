import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthForm() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err) {
            setError(getErrorMessage((err as Error).message));
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (message: string): string => {
        const errorMap: Record<string, string> = {
            'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
            'Email not confirmed': '이메일 인증이 필요합니다.',
            'User already registered': '이미 가입된 이메일입니다.',
            'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
        };
        return errorMap[message] || message;
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>{isSignUp ? '회원가입' : '로그인'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호 (6자 이상)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? '처리 중...' : isSignUp ? '가입하기' : '로그인'}
                    </button>
                </form>
                <p className="auth-switch">
                    <span>{isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}</span>
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? '로그인' : '회원가입'}
                    </button>
                </p>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}
