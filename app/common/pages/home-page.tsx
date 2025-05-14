import { Button } from '../components/ui/button';

const cloth = [
  {
    id: 1,
    shop: '로쏘',
    name: '반팔',
    size: 'S',
    color: '블랙',
    quantity: '10',
    price: '10000',
  },
  {
    id: 2,
    shop: '이올',
    name: '반바지',
    size: 'M',
    color: '블랙',
    quantity: '10',
    price: '10000',
  },
];

export default function HomePage() {
  return (
    <div className="p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">거래처 매장</th>
            <th className="border p-2 text-left">상품명</th>
            <th className="border p-2 text-left">사이즈</th>
            <th className="border p-2 text-left">색상</th>
            <th className="border p-2 text-left">수량</th>
            <th className="border p-2 text-left">가격</th>
          </tr>
        </thead>
        <tbody>
          {cloth.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.shop}</td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.size}</td>
              <td className="border p-2">{item.color}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
