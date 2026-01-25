import path from 'path';

class Storage {
  private baseStoragePath: string = path.join(__dirname, '../storage/');
  private basePublicPath: string = path.join(this.baseStoragePath, 'public/');

  public storagePath(relativePath = ''): string {
    return path.join(this.baseStoragePath, relativePath);
  }

  public publicPath(relativePath = ''): string {
    return path.join(this.basePublicPath, relativePath);
  }
}

const storage = new Storage();
export { storage };
