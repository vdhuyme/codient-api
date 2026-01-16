import path from 'path';

interface IStorage {
  storagePath(relativePath?: string): string;
}

class Storage implements IStorage {
  private baseStoragePath: string;

  constructor() {
    this.baseStoragePath = path.join(__dirname, '../storage/');
  }

  storagePath(relativePath = ''): string {
    return path.join(this.baseStoragePath, relativePath);
  }
}

const storage = new Storage();
export { storage };
