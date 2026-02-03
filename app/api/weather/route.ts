import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const APIKEY = process.env.APIKEY;

    console.log(APIKEY);
    
    // 1. URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city) {
    return NextResponse.json({ error: "都市名が必要です" }, { status: 400 });
    }

    // 2. URLを正しく組み立てる（バッククォートを使用！）
    // ${city} と ${APIKEY} を変数として展開します
    const APIURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&lang=ja&units=metric`;

    try {
    const response = await fetch(APIURL);

    if (!response.ok) {
        // API側で「都市が見つからない(404)」などの場合を考慮
        const errorData = await response.json();
        return NextResponse.json(
        { error: errorData.message || "天気データの取得に失敗しました" },
        { status: response.status }
        );
    }

    const data = await response.json();

    // 必要なデータだけを抽出してフロントに返すと親切です！
    return NextResponse.json({
        name: data.name,
        weather: data.weather[0].description,
        temp: data.main.temp,
    });
    } catch (error) {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}