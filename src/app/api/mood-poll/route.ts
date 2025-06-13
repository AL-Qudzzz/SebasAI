
// src/app/api/mood-poll/route.ts
import { NextResponse } from 'next/server';

interface PollOption {
  id: string;
  text: string;
  count: number;
}

interface PollData {
  question: string;
  options: PollOption[];
  lastReset: string; // Store date as string 'YYYY-MM-DD'
}

// In-memory store for poll data
// NOT FOR PRODUCTION: Data will reset on server restart.
// For production, use a database like Firestore.
let pollData: PollData = {
  question: "Bagaimana perasaan Anda secara keseluruhan hari ini?",
  options: [
    { id: 'great', text: "😄 Luar Biasa", count: 0 },
    { id: 'good', text: "🙂 Baik", count: 0 },
    { id: 'okay', text: "😐 Biasa Saja", count: 0 },
    { id: 'meh', text: "😕 Kurang Baik", count: 0 },
    { id: 'bad', text: "😟 Buruk", count: 0 },
  ],
  lastReset: new Date().toISOString().split('T')[0]!, // 'YYYY-MM-DD'
};

function checkAndResetPoll() {
  const today = new Date().toISOString().split('T')[0]!;
  if (today !== pollData.lastReset) {
    console.log(`Resetting poll counts for new day: ${today}`);
    pollData.options.forEach(opt => opt.count = 0);
    pollData.lastReset = today;
  }
}

export async function GET(request: Request) {
  checkAndResetPoll();
  return NextResponse.json(pollData);
}

export async function POST(request: Request) {
  checkAndResetPoll();
  try {
    const { optionId } = await request.json() as { optionId: string };
    const option = pollData.options.find(opt => opt.id === optionId);

    if (!option) {
      return NextResponse.json({ error: "Pilihan tidak valid." }, { status: 400 });
    }

    option.count += 1;
    console.log(`Vote cast for: ${option.text}, new count: ${option.count}`);
    return NextResponse.json(pollData);
  } catch (error) {
    console.error("Error processing poll vote:", error);
    return NextResponse.json({ error: "Gagal memproses suara." }, { status: 500 });
  }
}
