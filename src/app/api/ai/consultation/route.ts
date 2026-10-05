// src/app/api/ai/consultation/route.ts
// TrimFlow AI - Enterprise AI Haircut & Beard Consultation Engine
// Powered by Gemini Vision & Intelligent Face-Shape Heuristics

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { faceShape, clientImageBase64 } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is present, we can call the Gemini 1.5 Flash Vision endpoint
        // Official Google Gemini 1.5 Flash Vision SDK Call
        if (apiKey && clientImageBase64) {
          try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
            const prompt =
              'You are a master barber stylist. Analyze this client face and suggest the top 2 recommended haircut styles and beard contours. Keep the advice concise and technical for the barber.';
    
            const imagePart = {
              inlineData: {
                data: clientImageBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: 'image/jpeg',
              },
            };
    
            const result = await model.generateContent([prompt, imagePart]);
            const aiText = result.response.text();
    
            if (aiText) {
              return NextResponse.json({
                success: true,
                consultationSummary: aiText,
                source: 'gemini-1.5-flash-sdk',
              });
            }
          } catch (geminiErr) {
            console.error('Gemini SDK error:', geminiErr);
          }
        }
    // High-precision algorithmic style heuristic matrix
    let recommendation = '';
    const shape = (faceShape || 'oval').toLowerCase();

    if (shape === 'square') {
      recommendation =
        'Square Face: High Skin Fade with textured crop or quiff to soften angular jawline. Sharp 90-degree temple lineup with rounded goatee transition.';
    } else if (shape === 'round') {
      recommendation =
        'Round Face: High Volume Pompadour or Mid Bald Taper with length on top to create vertical elongation. Angular pointed beard with sharp low cheek lines.';
    } else if (shape === 'oval') {
      recommendation =
        'Oval Face: Classic Low Drop Fade with brushed-back sculpt. Balanced beard density with clean natural neckline.';
    } else {
      recommendation =
        'Diamond / Oblong Face: Medium Scissor Taper on sides with textured scissor cut on top. Full boxed beard to add lower facial width.';
    }

    return NextResponse.json({
      success: true,
      consultationSummary: recommendation,
      source: 'expert-style-engine',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
