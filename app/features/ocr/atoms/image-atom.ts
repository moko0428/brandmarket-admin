import { atom } from 'jotai';

// 원본 이미지 데이터를 저장하는 atom
export const originalImageAtom = atom<string | null>(null);

// 압축된 이미지 데이터를 저장하는 atom
export const compressedImageAtom = atom<string | null>(null);

// OCR 결과를 저장하는 atom
export const ocrResultAtom = atom<any | null>(null);

// 이미지 압축 함수
const compressImage = async (
  dataURL: string,
  maxWidth = 800,
  quality = 0.6
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataURL;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 최대 너비에 맞게 크기 조정
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataURL);

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // OCR에 최적화된 이미지 처리
      // 흑백 처리 (글자 인식 향상)
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);

      // 압축된 JPEG로 변환 (PNG보다 일반적으로 더 작음)
      const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataURL);
    };
  });
};

// 이미지 처리 atom (압축 작업 수행)
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
      // 이미지 압축 처리
      console.log(
        '원본 이미지 크기:',
        Math.round(imageData.length / 1024),
        'KB'
      );
      const compressed = await compressImage(imageData);
      console.log(
        '압축 이미지 크기:',
        Math.round(compressed.length / 1024),
        'KB'
      );

      // 압축된 이미지 저장
      set(compressedImageAtom, compressed);
      return compressed;
    } catch (error) {
      console.error('이미지 압축 오류:', error);
      // 압축 실패 시 원본 이미지 사용
      set(compressedImageAtom, imageData);
      return imageData;
    }
  }
);
