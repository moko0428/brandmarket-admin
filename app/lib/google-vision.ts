import { ImageAnnotatorClient } from '@google-cloud/vision';

const googleVisionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
});

export default googleVisionClient;
