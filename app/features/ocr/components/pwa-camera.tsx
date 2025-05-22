import { useEffect, useRef, useState } from 'react';
import { Button } from '~/common/components/ui/button';

export default function PwaCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    timestamp: string;
    size: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          // environment 모드로 설정 - 후면 카메라
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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기를 비디오 크기와 일치시킴
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 이미지를 데이터 URL로 변환
    const imageUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageUrl);

    // 이미지 정보 계산
    const now = new Date();
    const timestamp = now.toLocaleString('ko-KR');

    // 대략적인 이미지 크기 계산 (Base64 데이터 길이 기준)
    const base64Data = imageUrl.split(',')[1];
    const approximateSize = Math.round((base64Data.length * 0.75) / 1024); // KB 단위

    setImageInfo({
      width: canvas.width,
      height: canvas.height,
      timestamp: timestamp,
      size: `약 ${approximateSize} KB`,
    });
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setImageInfo(null);
  };

  return (
    <main className="flex flex-col items-center p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">카메라</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {!hasCamera && !error && <p>카메라를 준비 중입니다...</p>}

      {!error && !capturedImage && (
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

      {capturedImage && (
        <section className="w-full max-w-md">
          <h2 className="font-semibold mb-2">촬영된 사진</h2>
          <div className="relative">
            <img
              src={capturedImage}
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

          {imageInfo && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-2">이미지 정보</h3>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">크기:</span> {imageInfo.width} x{' '}
                  {imageInfo.height} 픽셀
                </li>
                <li>
                  <span className="font-medium">파일 크기:</span>{' '}
                  {imageInfo.size}
                </li>
                <li>
                  <span className="font-medium">촬영 시간:</span>{' '}
                  {imageInfo.timestamp}
                </li>
                <li>
                  <span className="font-medium">형식:</span> PNG
                </li>
              </ul>
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            <Button onClick={retakePhoto} variant="outline" className="flex-1">
              다시 찍기
            </Button>
            <Button className="flex-1">저장하기</Button>
          </div>
        </section>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  );
}
