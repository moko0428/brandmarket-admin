import { detectText } from '~/features/product/api/ocr';

export const config = {
  api: {
    // 파일 크기 제한 증가 (기본 4MB)
    bodyParser: {
      sizeLimit: '10mb',
    },
    // PWA에서의 CORS 지원
    cors: {
      origin: '*',
      methods: ['POST'],
    },
  },
};

export async function POST(request: Request) {
  try {
    // FormData 추출
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof File)) {
      return Response.json(
        { error: '유효한 이미지 파일이 아닙니다.' },
        { status: 400 }
      );
    }

    // 로깅용 - 디버깅 정보만 출력
    console.log('수신된 이미지:', {
      타입: imageFile.type,
      크기: Math.round(imageFile.size / 1024) + 'KB',
    });

    // File → Buffer 변환
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // OCR 처리
    const textAnnotations = await detectText(buffer);

    return Response.json({
      result: textAnnotations,
      success: true,
    });
  } catch (error) {
    console.error('OCR 처리 오류:', error);
    return Response.json(
      {
        error: 'OCR 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 }
    );
  }
}
