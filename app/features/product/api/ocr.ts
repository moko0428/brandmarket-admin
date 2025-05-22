import fs from 'fs';
import googleVisionClient from '~/lib/google-vision';

export async function detectText(imagePath: string) {
  const imageFile = fs.readFileSync(imagePath);
  const [result] = await googleVisionClient.textDetection({
    image: {
      content: imageFile.toString('base64'),
    },
  });
  return result.textAnnotations || [];
}
