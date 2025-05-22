import { atom } from 'jotai';

// 원본 이미지 데이터 저장용 atom
export const originalImageAtom = atom<string | null>(null);

// 압축된 이미지 데이터 저장용 atom
export const compressedImageAtom = atom<string | null>(null);

// OCR 결과 저장용 atom
export const ocrResultAtom = atom<any | null>(null);

// 로딩 상태 atom
export const loadingAtom = atom<boolean>(false);

// 에러 상태 atom
export const errorAtom = atom<string | null>(null);

// 이미지 압축 처리 함수
export const processImageAtom = atom(
  null,
  async (get, set, imageData: string | null) => {
    if (!imageData) {
      set(originalImageAtom, null);
      set(compressedImageAtom, null);
      return null;
    }

    // 원본 이미지 저장
    set(originalImageAtom, imageData);

    try {
      // Canvas를 사용한 이미지 압축 로직
      const img = new Image();

      // 이미지 로드 완료 대기
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      // Canvas 생성 및 크기 설정
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 이미지 크기 조정 (최대 800px)
      const maxWidth = 800;
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // 압축 이미지 생성 (품질 0.7)
      const compressedData = canvas.toDataURL('image/jpeg', 0.7);

      // 압축 이미지 저장
      set(compressedImageAtom, compressedData);

      console.log('원본 크기:', Math.round(imageData.length / 1024), 'KB');
      console.log('압축 크기:', Math.round(compressedData.length / 1024), 'KB');

      return compressedData;
    } catch (error) {
      console.error('이미지 압축 오류:', error);
      set(errorAtom, '이미지 압축 중 오류가 발생했습니다.');

      // 압축 실패 시 원본 반환
      set(compressedImageAtom, imageData);
      return imageData;
    }
  }
);
