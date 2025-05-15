// import vision from '@google-cloud/vision';
// export default function ProductPage() {
//   // vision.ts

//   // JSON 키 파일 경로 (자신의 위치로 수정)
// const client = new vision.ImageAnnotatorClient({
//   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
// });

//   async function detectTextFromImage(imagePath: string) {
//     const [result] = await client.textDetection(imagePath);
//     const detections = result.textAnnotations;

//     if (detections && detections.length > 0) {
//       console.log('추출된 텍스트:', detections[0].description);
//       return detections[0].description;
//     } else {
//       console.log('텍스트를 찾을 수 없습니다.');
//       return null;
//     }
//   }

//   // 사용 예시
//   detectTextFromImage('./sample.jpg');

//   return <div>ProductPage</div>;
// }
export default function ProductPage() {
  return <div>ProductPage</div>;
}
