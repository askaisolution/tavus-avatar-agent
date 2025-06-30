import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    replica_id,
    persona_id,
    conversation_name,
    conversation_context,
    custom_greeting,
  } = body;

  if (!replica_id || !persona_id || !conversation_name || !conversation_context) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const payload: any = {
    replica_id,
    persona_id,
    conversation_name,
    conversational_context: conversation_context,
  };

  if (custom_greeting) {
    payload.custom_greeting = custom_greeting;
  }

  if (!process.env.TAVUS_API_KEY) {
    throw new Error("TAVUS_API_KEY is not defined in .env.local");
    }

  const response = await fetch('https://tavusapi.com/v2/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.TAVUS_API_KEY!, // Replace with env var in prod
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.conversation_url) {
    return NextResponse.json({ url: data.conversation_url });
  } else {
    return NextResponse.json({ error: 'API error', details: data }, { status: 500 });
  }
}
