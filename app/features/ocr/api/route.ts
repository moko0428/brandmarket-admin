import { json, type ActionFunction } from '@remix-run/node';
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
});

export const action: ActionFunction = async ({ request }) => {
  try {
    const data = await request.json();
    const { imageBase64 } = data;
    if (!imageBase64) {
      return json({ error: 'No image data' }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const [result] = await client.textDetection({
      image: { content: Buffer.from(base64Data, 'base64') },
    });

    const detections = result.textAnnotations || [];

    // 각 textAnnotation 의 description 배열 반환
    const texts = detections.map((item) => item.description);

    return json({ texts });
  } catch (error) {
    console.error('OCR Error:', error);
    return json({ error: 'OCR 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
};
