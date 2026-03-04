import { useEffect, useRef, useCallback } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Memo } from '../lib/supabase';

interface MemoListProps {
    memos: Memo[];
    hasMore: boolean;
    loadingMore: boolean;
    onLoadMore: () => void;
}

export function MemoList({ memos, hasMore, loadingMore, onLoadMore }: MemoListProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const prevLengthRef = useRef(0);

    // 스크롤 위치 관리
    useEffect(() => {
        if (listRef.current) {
            // 초기 로딩 시 (0개 -> 여러개) 또는 새 메모 추가 시 (1개 증가) 스크롤 맨 아래로
            if (prevLengthRef.current === 0 || memos.length === prevLengthRef.current + 1) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }
            prevLengthRef.current = memos.length;
        }
    }, [memos.length]);

    // 무한 스크롤 핸들러
    const handleScroll = useCallback(() => {
        if (!listRef.current || loadingMore || !hasMore) return;

        // 스크롤이 맨 위 근처에 도달하면 더 로드
        if (listRef.current.scrollTop < 100) {
            const prevScrollHeight = listRef.current.scrollHeight;
            onLoadMore();

            // 로드 후 스크롤 위치 유지
            requestAnimationFrame(() => {
                if (listRef.current) {
                    const newScrollHeight = listRef.current.scrollHeight;
                    listRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                }
            });
        }
    }, [loadingMore, hasMore, onLoadMore]);

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        if (isToday(date)) return '오늘';
        if (isYesterday(date)) return '어제';
        return format(date, 'M월 d일', { locale: ko });
    };

    const formatTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return format(date, 'a h:mm', { locale: ko });
    };

    const getDateKey = (dateStr: string): string => {
        return new Date(dateStr).toDateString();
    };

    if (memos.length === 0) {
        return (
            <div className="memo-list" ref={listRef}>
                <div className="empty-state">
                    <div className="empty-state-icon">💭</div>
                    <div className="empty-state-text">첫 번째 메모를 작성해보세요!</div>
                </div>
            </div>
        );
    }

    let lastDateKey = '';

    return (
        <div className="memo-list" ref={listRef} onScroll={handleScroll}>
            {loadingMore && (
                <div className="loading-more">이전 메모 불러오는 중...</div>
            )}
            {memos.map((memo) => {
                const dateKey = getDateKey(memo.created_at);
                const showDivider = dateKey !== lastDateKey;
                lastDateKey = dateKey;

                return (
                    <div key={memo.id}>
                        {showDivider && (
                            <div className="date-divider">{formatDate(memo.created_at)}</div>
                        )}
                        <div className="memo-item">
                            <div className="memo-time">{formatTime(memo.created_at)}</div>
                            <div className="memo-bubble">{memo.content}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
