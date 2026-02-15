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
            <div className="text-sm text-gray-400 text-center mt-2">
                🤖 AIが分析中...
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
