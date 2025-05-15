import { useEffect, useRef, useState } from 'react';
import { Button } from '~/common/components/ui/button';

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 모바일 디바이스 여부 확인
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  useEffect(() => {
    if (!isMobile) {
      setError('이 기능은 모바일 환경에서만 사용할 수 있습니다.');
      setLoading(false);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setError('브라우저가 카메라를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        setError('카메라 권한이 없거나 사용할 수 없습니다.');
        console.error(err);
      } finally {
        setLoading(false);
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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL('image/png');
    console.log(imageUrl);
    setCapturedImage(imageUrl);
  };

  return (
    <main className="flex flex-col items-center p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">카메라 촬영</h1>

      {!isMobile && (
        <p className="text-blue-600 mb-2">현재 브라우저 환경 상태입니다</p>
      )}

      {loading && <p>카메라를 준비 중입니다...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {hasCamera && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md rounded-md border border-gray-300"
          />
          <Button onClick={capturePhoto} className="mt-4">
            사진 찍기
          </Button>
        </>
      )}

      {capturedImage && (
        <section className="mt-6 w-full max-w-md">
          <h2 className="font-semibold mb-2">촬영된 사진</h2>
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-md border border-gray-300 shadow"
          />
        </section>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  );
}
