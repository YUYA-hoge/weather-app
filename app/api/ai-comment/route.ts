import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini APIキーが設定されていません" }, { status: 500 });
    }

    // リクエストボディを取得
    const { weather, temp, city } = await request.json();

    if (!weather || temp === undefined || temp === null) {
        return NextResponse.json({ error: "weather と temp は必須です" }, { status: 400 });
    }

    const prompt = `
天気: ${weather}、気温: ${temp}℃、都市: ${city || "不明"}

以下のJSON形式で厳密に出力してください（余分なテキスト不要）:
{
  "comment": "服装・持ち物・活動のアドバイスを2〜3文の日本語で",
  "scores": {
    "outdoor":  { "score": スコア, "label": "10文字以内の評価" },
    "exercise": { "score": スコア, "label": "10文字以内の評価" },
    "laundry":  { "score": スコア, "label": "10文字以内の評価" },
    "drive":    { "score": スコア, "label": "10文字以内の評価" }
  }
}
スコア基準: 1=不向き, 2=やや不向き, 3=普通, 4=向いている, 5=最適
    `;

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
        });

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());

        return NextResponse.json(data);
    } catch (error) {
        console.error("Gemini APIエラー:", error);
        return NextResponse.json({ error: "AI生成に失敗しました" }, { status: 500 });
    }
}
