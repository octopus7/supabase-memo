import { useState, useEffect } from 'react';
import { supabase, Memo } from '../lib/supabase';
import JSZip from 'jszip';

interface WeekData {
    weekStart: Date;
    weekEnd: Date;
    label: string;
    memoCount: number;
}

// 주의 시작일 (월요일 기준)을 구하는 함수
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// 주의 종료일 (일요일)을 구하는 함수
function getWeekEnd(date: Date): Date {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

// 날짜 포맷팅
function formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
}

// 주차 라벨 생성
function getWeekLabel(weekStart: Date, weekEnd: Date): string {
    const startMonth = weekStart.getMonth() + 1;
    const startDay = weekStart.getDate();
    const endMonth = weekEnd.getMonth() + 1;
    const endDay = weekEnd.getDate();
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
        return `${year}년 ${startMonth}월 ${startDay}일 ~ ${endDay}일`;
    }
    return `${year}년 ${startMonth}/${startDay} ~ ${endMonth}/${endDay}`;
}

interface BackupPageProps {
    onBack: () => void;
}

export function BackupPage({ onBack }: BackupPageProps) {
    const [weeks, setWeeks] = useState<WeekData[]>([]);
    const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        loadWeeksWithMemos();
    }, []);

    const loadWeeksWithMemos = async () => {
        setLoading(true);

        // 모든 메모의 날짜 가져오기
        const { data, error } = await supabase
            .from('memos')
            .select('created_at')
            .order('created_at', { ascending: false });

        if (error || !data) {
            setLoading(false);
            return;
        }

        // 주차별로 그룹화
        const weekMap = new Map<string, WeekData>();

        data.forEach((memo) => {
            const memoDate = new Date(memo.created_at);
            const weekStart = getWeekStart(memoDate);
            const weekEnd = getWeekEnd(memoDate);
            const key = formatDate(weekStart);

            if (weekMap.has(key)) {
                const week = weekMap.get(key)!;
                week.memoCount++;
            } else {
                weekMap.set(key, {
                    weekStart,
                    weekEnd,
                    label: getWeekLabel(weekStart, weekEnd),
                    memoCount: 1
                });
            }
        });

        setWeeks(Array.from(weekMap.values()));
        setLoading(false);
    };

    const toggleWeek = (weekKey: string) => {
        setSelectedWeeks((prev) => {
            const next = new Set(prev);
            if (next.has(weekKey)) {
                next.delete(weekKey);
            } else {
                next.add(weekKey);
            }
            return next;
        });
    };

    const selectAll = () => {
        if (selectedWeeks.size === weeks.length) {
            setSelectedWeeks(new Set());
        } else {
            setSelectedWeeks(new Set(weeks.map(w => formatDate(w.weekStart))));
        }
    };

    const generateWeekContent = async (weekStart: Date, weekEnd: Date): Promise<string> => {
        const { data, error } = await supabase
            .from('memos')
            .select('*')
            .gte('created_at', weekStart.toISOString())
            .lte('created_at', weekEnd.toISOString())
            .order('created_at', { ascending: true });

        if (error || !data) return '';

        const label = getWeekLabel(weekStart, weekEnd);
        let content = `=== ${label} ===\n\n`;

        data.forEach((memo: Memo) => {
            content += `[${formatDateTime(memo.created_at)}] ${memo.content}\n`;
        });

        return content;
    };

    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadZip = async (files: { name: string; content: string }[]) => {
        const zip = new JSZip();

        files.forEach(file => {
            zip.file(file.name, file.content);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memos_backup_${formatDate(new Date())}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownload = async () => {
        if (selectedWeeks.size === 0) return;

        setDownloading(true);

        const selectedWeekData = weeks.filter(w =>
            selectedWeeks.has(formatDate(w.weekStart))
        );

        if (selectedWeekData.length === 1) {
            // 단일 주차: 텍스트 파일 다운로드
            const week = selectedWeekData[0];
            const content = await generateWeekContent(week.weekStart, week.weekEnd);
            const filename = `memos_${formatDate(week.weekStart)}.txt`;
            downloadFile(content, filename);
        } else {
            // 복수 주차: ZIP 다운로드
            const files: { name: string; content: string }[] = [];

            for (const week of selectedWeekData) {
                const content = await generateWeekContent(week.weekStart, week.weekEnd);
                const filename = `memos_${formatDate(week.weekStart)}.txt`;
                files.push({ name: filename, content });
            }

            await downloadZip(files);
        }

        setDownloading(false);
    };

    if (loading) {
        return (
            <div className="backup-container">
                <div className="backup-header">
                    <button className="btn-back" onClick={onBack}>← 뒤로</button>
                    <h2>📦 백업</h2>
                </div>
                <div className="loading">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="backup-container">
            <div className="backup-header">
                <button className="btn-back" onClick={onBack}>← 뒤로</button>
                <h2>📦 백업</h2>
            </div>

            {weeks.length === 0 ? (
                <div className="backup-empty">
                    백업할 메모가 없습니다.
                </div>
            ) : (
                <>
                    <div className="backup-actions">
                        <button className="btn-select-all" onClick={selectAll}>
                            {selectedWeeks.size === weeks.length ? '전체 해제' : '전체 선택'}
                        </button>
                        <span className="selected-count">
                            {selectedWeeks.size}개 선택
                        </span>
                    </div>

                    <div className="week-list">
                        {weeks.map((week) => {
                            const weekKey = formatDate(week.weekStart);
                            const isSelected = selectedWeeks.has(weekKey);
                            return (
                                <label key={weekKey} className={`week-item ${isSelected ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleWeek(weekKey)}
                                    />
                                    <div className="week-info">
                                        <span className="week-label">{week.label}</span>
                                        <span className="week-count">{week.memoCount}개 메모</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <div className="backup-footer">
                        <button
                            className="btn-download"
                            onClick={handleDownload}
                            disabled={selectedWeeks.size === 0 || downloading}
                        >
                            {downloading ? '다운로드 중...' :
                                selectedWeeks.size > 1 ? `ZIP 다운로드 (${selectedWeeks.size}주)` :
                                    '다운로드'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
