import { Link } from 'react-router';

const cloth = [
  {
    id: 1,
    shop: '로쏘',
    name: '반팔',
    quantity: '10',
    price: '10000',
    total: '100000',
  },
  {
    id: 2,
    shop: '이올',
    name: '반바지',
    quantity: '10',
    price: '10000',
    total: '100000',
  },
];

export default function HomePage() {
  return (
    <div className="p-4">
      <Link to="/ocr">OCR</Link>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">거래처 매장</th>
            <th className="border p-2 text-left">품명</th>

            <th className="border p-2 text-left">단가</th>
            <th className="border p-2 text-left">수량</th>
            <th className="border p-2 text-left">금액</th>
          </tr>
        </thead>
        <tbody>
          {cloth.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.shop}</td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.price}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
