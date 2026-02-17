// スコアに応じた星文字列を返す
function scoreStars(score: number): string {
    return "★".repeat(score) + "☆".repeat(5 - score);
}

// スコアに応じた色クラスを返す
function scoreColorClass(score: number): string {
    if (score >= 4) return "text-green-500";
    if (score === 3) return "text-yellow-500";
    return "text-red-400";
}

interface ActivityScore {
    score: number;
    label: string;
}

interface AiScores {
    outdoor: ActivityScore;
    exercise: ActivityScore;
    laundry: ActivityScore;
    drive: ActivityScore;
}

type Props = {
    comment: string;
    scores: AiScores | null;
    loading: boolean;
    error: boolean;
};

const ACTIVITIES: { key: keyof AiScores; emoji: string; name: string }[] = [
    { key: "outdoor",  emoji: "🌿", name: "外出" },
    { key: "exercise", emoji: "🏃", name: "運動" },
    { key: "laundry",  emoji: "👕", name: "洗濯" },
    { key: "drive",    emoji: "🚗", name: "ドライブ" },
];

export default function AiCommentCard({ comment, scores, loading, error }: Props) {
    // ローディング中
    if (loading) {
        return (
            <div className="w-full bg-blue-50 rounded-2xl p-4 mt-2 flex flex-col gap-3">
                {/* スピナー + テキスト */}
                <div className="flex items-center gap-2">
                    <svg
                        className="animate-spin motion-reduce:animate-none w-5 h-5 text-blue-400 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    <span className="text-sm font-medium text-blue-600">AIが分析中...</span>
                </div>

                {/* コメント部分のスケルトン */}
                <div className="flex flex-col gap-2 animate-pulse motion-reduce:animate-none">
                    <div className="h-3 bg-blue-200 rounded-full w-full" />
                    <div className="h-3 bg-blue-200 rounded-full w-4/5" />
                </div>

                {/* スコア部分のスケルトン */}
                <div className="flex flex-col gap-2 animate-pulse motion-reduce:animate-none">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-3 bg-blue-200 rounded-full w-16" />
                            <div className="h-3 bg-blue-200 rounded-full w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // エラー時・データなし時は何も表示しない
    if (error || (!comment && !scores)) return null;

    return (
        <div className="w-full bg-blue-50 rounded-2xl p-4 mt-2 flex flex-col gap-3">
            {/* AIコメント */}
            <p className="text-sm text-gray-700 leading-relaxed">{comment}</p>

            {/* 活動スコア */}
            {scores && (
                <div className="flex flex-col gap-1.5">
                    {ACTIVITIES.map(({ key, emoji, name }) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="w-16 text-sm text-gray-600">{emoji} {name}</span>
                            <span className={`text-sm ${scoreColorClass(scores[key].score)}`}>
                                {scoreStars(scores[key].score)}
                            </span>
                            <span className="text-xs text-gray-500">{scores[key].label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
