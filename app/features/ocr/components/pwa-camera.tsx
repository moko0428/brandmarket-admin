import { useEffect, useRef, useState } from 'react';
import { Button } from '~/common/components/ui/button';

export default function PwaCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrTexts, setOcrTexts] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setCapturedImage(imageUrl);

    // OCR API 호출
    setLoading(true);
    setOcrTexts(null);
    setError(null);
    try {
      const response = await fetch('/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setOcrTexts(data.texts || []);
      } else {
        setError(data.error || 'OCR 처리 중 오류가 발생했습니다.');
      }
    } catch (e) {
      setError('서버와 통신 중 오류가 발생했습니다.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">영수증 스캔하기</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {!hasCamera && !error && <p>카메라를 준비 중입니다...</p>}

      {!error && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md rounded-md border border-gray-300 bg-black"
          />
          <Button
            onClick={capturePhoto}
            disabled={!hasCamera || loading}
            className="mt-4 w-full max-w-md"
          >
            {loading ? '처리 중...' : '사진 찍기'}
          </Button>
        </>
      )}

      {capturedImage && (
        <section className="mt-6 w-full max-w-md">
          <h2 className="font-semibold mb-2">영수증 스캔 결과</h2>
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-md border border-gray-300 shadow"
          />
          {loading && <p>OCR 처리 중...</p>}
          {ocrTexts && (
            <section className="mt-2 bg-gray-100 p-2 rounded max-h-64 overflow-auto text-sm text-gray-700">
              {ocrTexts.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </section>
          )}
        </section>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  );
}
