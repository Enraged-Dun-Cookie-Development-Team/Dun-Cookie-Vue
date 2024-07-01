import { Http } from '@enraged-dun-cookie-development-team/common/request';
import PlatformHelper from '../../common/platform/PlatformHelper';

PlatformHelper.Message.registerListener('img2blob', 'offscreen:img2blob', async (data) => {
  const blob = await Http.get(data.imageUrl, { responseTransformer: (r) => r.blob() });
  const canvas = document.createElement('canvas');
  canvas.height = 200;
  canvas.width = 400;
  const ctx = canvas.getContext('2d');
  const bitmap = await createImageBitmap(blob, { resizeWidth: canvas.width });
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  /**
   * @type {unknown}
   */
  const newBlob = await new Promise((r) => canvas.toBlob(r));
  return URL.createObjectURL(newBlob);
});
