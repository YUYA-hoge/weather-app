import { NextResponse } from "next/server";

export async function GET() {
  console.log("API到達!");
  console.log("URL:", process.env.SUPABASE_URL);
  
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) throw new Error("環境変数が足りません");

    const res = await fetch(`${url}/rest/v1/cities?select=*`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Supabaseからのエラー:", errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}