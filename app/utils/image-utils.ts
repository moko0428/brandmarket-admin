/**
 * Base64 이미지 데이터를 Blob으로 변환
 */
export async function base64ToBlob(base64Data: string): Promise<Blob> {
  const base64 = base64Data.split(',')[1];

  const response = await fetch(`data:image/jpeg;base64,${base64}`);
  return await response.blob();
}
