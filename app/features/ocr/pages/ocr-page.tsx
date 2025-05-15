// app/routes/ocr.tsx

import vision from '@google-cloud/vision';
import type { Route } from './+types/ocr-page';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('imageUrl');
  if (!imageUrl) {
    return json({ error: '이미지 URL이 없습니다.' }, { status: 400 });
  }

  const [result] = await client.textDetection(imageUrl);
  const detections = result.textAnnotations;
  const detectedText =
    detections && detections.length > 0 ? detections[0].description : null;

  return json({ detectedText });
};

type LoaderData = {
  detectedText?: string;
  error?: string;
};

export default function OcrPage({ loaderData }: { loaderData: LoaderData }) {
  if (loaderData.error) {
    return <div>오류: {loaderData.error}</div>;
  }

  return (
    <div>
      <h1>OCR 결과</h1>
      <pre>{loaderData.detectedText ?? '인식된 텍스트가 없습니다.'}</pre>
    </div>
  );
}
