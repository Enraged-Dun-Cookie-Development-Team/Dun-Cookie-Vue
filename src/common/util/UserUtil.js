import { v4 as uuidV4 } from 'uuid';

const client_id_key = 'ceobe_user_client_id';

export class UserUtil {
  static async getClientId() {
    let id = await PlatformHelper.Storage.getLocalStorage(client_id_key);
    if (!id) {
      id = uuidV4();
      await PlatformHelper.Storage.saveLocalStorage(client_id_key, id);
    }
    return id;
  }
}
