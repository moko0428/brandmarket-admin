import { useEffect, useRef, useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { useAtom, useSetAtom } from 'jotai';
import {
  originalImageAtom,
  compressedImageAtom,
  processImageAtom,
  ocrResultAtom,
  loadingAtom,
  errorAtom,
} from '../atoms/image-atom';

export default function OcrPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);

  // Jotai atoms
  const [originalImage, setOriginalImage] = useAtom(originalImageAtom);
  const [compressedImage] = useAtom(compressedImageAtom);
  const [ocrResult, setOcrResult] = useAtom(ocrResultAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const processImage = useSetAtom(processImageAtom);

  // 카메라 시작
  useEffect(() => {
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
        setError('카메라 접근이 차단되었거나 사용할 수 없습니다.');
        console.error('Camera error:', err);
      }
    }

    startCamera();

    // 정리 함수
    return () => {
      const video = videoRef.current;
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [setError]);

  // 사진 촬영
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 비디오 크기 가져오기
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // 캔버스 크기 설정
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // 비디오 프레임을 캔버스에 그리기
    ctx?.drawImage(video, 0, 0, videoWidth, videoHeight);

    // 캔버스에서 이미지 데이터 가져오기
    const imageData = canvas.toDataURL('image/jpeg');

    // 이미지 압축 처리
    await processImage(imageData);
  };

  // 다시 촬영
  const retakePhoto = () => {
    setOriginalImage(null);
    setOcrResult(null);
    setError(null);
  };

  // OCR 처리
  const processOcr = async () => {
    if (!compressedImage) return;

    setLoading(true);
    setError(null);

    try {
      // Base64 → Blob 변환
      const base64Data = compressedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: 'image/jpeg' });

      // FormData 생성
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      // API 호출
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('서버 오류가 발생했습니다.');
      }

      const data = await response.json();
      setOcrResult(data.result);
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      setError('OCR 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">OCR 텍스트 인식</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!originalImage ? (
        <section className="w-full max-w-md">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-md overflow-hidden mb-4">
            {hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>카메라를 불러오는 중...</p>
              </div>
            )}
          </div>

          <Button
            onClick={capturePhoto}
            className="w-full"
            disabled={!hasCamera}
          >
            사진 찍기
          </Button>
        </section>
      ) : (
        <section className="w-full max-w-md">
          <h2 className="font-semibold mb-2">촬영된 사진</h2>
          <div className="relative">
            <img
              src={compressedImage || originalImage}
              alt="촬영된 이미지"
              className="w-full rounded-md border border-gray-300 shadow"
            />
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
                {ocrResult[0]?.description || '텍스트를 인식하지 못했습니다.'}
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
