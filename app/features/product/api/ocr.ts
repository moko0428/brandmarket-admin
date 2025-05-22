import googleVisionClient from '~/lib/google-vision';

export async function detectText(input: string | Buffer) {
  const [result] = await googleVisionClient.textDetection(
    typeof input === 'string'
      ? input
      : {
          image: {
            content: input,
          },
        }
  );
  return result.textAnnotations || [];
}
