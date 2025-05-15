import { json, type ActionFunction } from '@remix-run/node';

// Google Cloud Vision API 클라이언트
import { ImageAnnotatorClient } from '@google-cloud/vision';

// 구글 인증키 파일 경로나 환경변수 세팅 필요
const client = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
});

export const action: ActionFunction = async ({ request }) => {
  try {
    const data = await request.json();
    const { imageBase64 } = data;
    if (!imageBase64) {
      return json({ error: 'No image data' }, { status: 400 });
    }

    // base64 앞부분 "data:image/png;base64," 제거
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Google Cloud Vision API 호출 (TEXT_DETECTION)
    const [result] = await client.textDetection({
      image: {
        content: Buffer.from(base64Data, 'base64'),
      },
    });

    const detections = result.textAnnotations;
    const extractedText = detections?.[0]?.description || '';

    return json({ text: extractedText });
  } catch (error) {
    console.error('OCR Error:', error);
    return json({ error: 'OCR 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
};
