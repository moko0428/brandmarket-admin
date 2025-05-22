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
  const [cameraLoading, setCameraLoading] = useState(true);

  // Jotai atoms
  const [originalImage, setOriginalImage] = useAtom(originalImageAtom);
  const [compressedImage] = useAtom(compressedImageAtom);
  const [ocrResult, setOcrResult] = useAtom(ocrResultAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const processImage = useSetAtom(processImageAtom);

  // 모바일 환경 체크
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // 카메라 시작
  useEffect(() => {
    // 비모바일 환경 체크
    if (!isMobile) {
      setCameraLoading(false);
      setError('이 기능은 모바일 환경에서만 사용할 수 있습니다.');
      return;
    }

    let cameraTimeout: NodeJS.Timeout;
    let stream: MediaStream | null = null;

    async function startCamera() {
      setCameraLoading(true);
      setError(null);

      // 카메라 초기화 타임아웃 설정 (10초)
      cameraTimeout = setTimeout(() => {
        setCameraLoading(false);
        setError(
          '카메라 초기화 시간이 초과되었습니다. 페이지를 새로고침하거나 브라우저 설정에서 카메라 권한을 확인해주세요.'
        );
      }, 10000);

      try {
        // 후면 카메라 우선 사용
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // 비디오가 로드되면 카메라 준비 완료
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(cameraTimeout);
            setCameraLoading(false);
            setHasCamera(true);
          };
        }
      } catch (err) {
        clearTimeout(cameraTimeout);
        setCameraLoading(false);

        // 오류 유형에 따른 메시지 설정
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            setError(
              '카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.'
            );
          } else if (err.name === 'NotFoundError') {
            setError(
              '카메라를 찾을 수 없습니다. 장치에 카메라가 있는지 확인해주세요.'
            );
          } else {
            setError(`카메라 오류: ${err.message}`);
          }
        } else {
          setError('카메라 접근 중 알 수 없는 오류가 발생했습니다.');
        }

        console.error('카메라 오류:', err);
      }
    }

    startCamera();

    // 정리 함수
    return () => {
      clearTimeout(cameraTimeout);

      // 스트림 정리
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // 비디오 요소 정리
      if (videoRef.current?.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream;
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMobile, setError]);

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
            {!isMobile ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-center px-4">
                  이 기능은 모바일 환경에서만 사용할 수 있습니다.
                  <br />
                  스마트폰이나 태블릿에서 접속해주세요.
                </p>
              </div>
            ) : cameraLoading ? (
              <div className="flex items-center justify-center h-full flex-col">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p>카메라를 불러오는 중...</p>
                <p className="text-xs mt-2 text-gray-500">
                  카메라 권한을 요청하면 '허용'을 눌러주세요
                </p>
              </div>
            ) : hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-center px-4">
                  카메라를 사용할 수 없습니다.
                  <br />
                  브라우저 설정에서 카메라 권한을 확인해주세요.
                </p>
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
