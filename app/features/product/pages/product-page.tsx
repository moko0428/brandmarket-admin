import { useState } from 'react';
import { Form } from 'react-router';
import type { Route } from './+types/product-page';

import googleVisionClient from '~/lib/google-vision';
import { detectText } from '../api/ocr';

// ... existing code ...
export const loader = async ({ request }: Route.LoaderArgs) => {
  const client = googleVisionClient;
  const result = await detectText('./public/images/영수증2.png');
  const [result2] = await detectText('./public/images/영수증2.png');
  // console.log('result', result2.description)
  const r = result2.description?.slice(132) || '';
  return { r };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const imageFile = formData.get('image') as File;

  if (!imageFile) {
    return { status: 400 };
  }

  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const [result] = await googleVisionClient.textDetection({
      image: { content: buffer },
    });
    return { texts: result.textAnnotations || [] };
  } catch (error) {
    console.error('OCR Error:', error);
    return { status: 500 };
  }
};
// ... existing code ...

export default function OcrTestUI({ loaderData }: Route.ComponentProps) {
  const [imageFileName, setImageFileName] = useState('receipt.jpg');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">영수증 OCR 테스트</h1>

      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl mb-4">테스트 이미지 선택</h2>
        <p className="mb-2 text-gray-600">
          public/images 디렉토리에 있는 이미지 파일명을 입력하세요.
        </p>

        <Form method="post" encType="multipart/form-data">
          <div>
            <label htmlFor="image" className="block mb-1 font-medium">
              이미지 선택:
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OCR 분석 실행
          </button>
        </Form>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">OCR 분석 결과</h2>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-white border rounded shadow">
            {loaderData.r}
          </div>

          <div className="p-4 bg-white border rounded shadow">
            <h3 className="text-lg font-medium mb-2">상품 목록</h3>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border">상품명</th>
                  <th className="p-2 text-right border">가격</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{item}</td>
                    <td className="p-2 text-right border">
                      {item.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-gray-500">상품 정보를 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="text-lg font-medium mb-2">사용 방법</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            OCR 테스트할 영수증 이미지를 <code>public/images</code> 디렉토리에
            업로드하세요.
          </li>
          <li>
            위의 입력란에 파일명을 입력하세요 (예: <code>receipt.jpg</code>)
          </li>
          <li>"OCR 분석 실행" 버튼을 클릭하면 결과가 표시됩니다.</li>
        </ol>
      </div>
    </div>
  );
}
