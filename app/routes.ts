import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('common/pages/home-page.tsx'),
  route('/product', 'features/product/pages/product-page.tsx'),
  route('/ocr', 'features/ocr/pages/ocr-page.tsx'),
  route('/ocr/api', 'routes/ocr.api.ts'),
] satisfies RouteConfig;
