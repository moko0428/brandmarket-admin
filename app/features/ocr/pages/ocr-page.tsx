import { useEffect, useRef, useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { detectText } from '~/features/product/api/ocr';
import { useAtom, useSetAtom } from 'jotai';
import {
  originalImageAtom,
  compressedImageAtom,
  processImageAtom,
  ocrResultAtom,
} from '../atoms/image-atom';

export default function OcrPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Jotai atoms
  const [originalImage] = useAtom(originalImageAtom);
  const [compressedImage] = useAtom(compressedImageAtom);
  const processImage = useSetAtom(processImageAtom);
  const [ocrResult, setOcrResult] = useAtom(ocrResultAtom);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  useEffect(() => {
    if (!isMobile) {
      setError('삐-빅! 이 기능은 모바일 환경에서만 사용할 수 있습니다.');
      return;
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        setError('삐-빅! 카메라 접근이 차단되었거나 사용할 수 없습니다.');
        console.error('Camera error:', err);
      }
    }

    startCamera();

    return () => {
      const video = videoRef.current;
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isMobile]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL('image/png');

    // 원본 이미지 저장 및 압축 처리
    await processImage(imageUrl);
  };

  const retakePhoto = () => {
    // 이미지와 OCR 결과 초기화
    processImage(null);
    setOcrResult(null);
  };

  // OCR 처리 함수 - URL 리다이렉션 대신 직접 API 호출
  const processOcr = async () => {
    if (!compressedImage) return;

    setLoading(true);
    try {
      // Base64 이미지 데이터 추출
      const base64Data = compressedImage.replace(
        /^data:image\/\w+;base64,/,
        ''
      );
      const buffer = Buffer.from(base64Data, 'base64');

      // OCR 처리
      const [result] = await detectText(buffer);
      setOcrResult(result);
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      setError('OCR 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">카메라</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {!hasCamera && !error && <p>카메라를 준비 중입니다...</p>}

      {!error && !originalImage && (
        <>
          <div className="relative w-full max-w-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-md border border-gray-300 bg-black"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button
                onClick={capturePhoto}
                disabled={!hasCamera}
                className="px-6 py-3 rounded-full bg-white text-black border border-gray-300 hover:bg-gray-100"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-black">
                  <span className="sr-only">사진 찍기</span>
                </span>
              </Button>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            카메라를 영수증에 맞춰 사진을 찍으세요.
          </p>
        </>
      )}

      {originalImage && (
        <section className="w-full max-w-md">
          <h2 className="font-semibold mb-2">촬영된 사진</h2>
          <div className="relative">
            <img
              src={originalImage}
              alt="촬영된 이미지"
              className="w-full rounded-md border border-gray-300 shadow"
            />
            <Button
              onClick={retakePhoto}
              className="absolute top-2 right-2 bg-white text-black p-2 rounded-full shadow hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
                <line x1="9" y1="10" x2="15" y2="10"></line>
              </svg>
              <span className="sr-only">다시 찍기</span>
            </Button>
          </div>

          {compressedImage && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-2">이미지 정보</h3>
              <p>원본 크기: {Math.round(originalImage.length / 1024)} KB</p>
              <p>압축 크기: {Math.round(compressedImage.length / 1024)} KB</p>
              <p>
                압축률:{' '}
                {Math.round(
                  (1 - compressedImage.length / originalImage.length) * 100
                )}
                %
              </p>
            </div>
          )}

          {ocrResult && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-2">OCR 결과</h3>
              <div>
                {ocrResult.description || '텍스트를 인식하지 못했습니다.'}
              </div>
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            <Button onClick={retakePhoto} variant="outline" className="flex-1">
              다시 찍기
            </Button>
            <Button
              onClick={processOcr}
              className="flex-1"
              disabled={loading || !compressedImage}
            >
              {loading ? '처리 중...' : 'OCR 처리하기'}
            </Button>
          </div>
        </section>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  );
}
