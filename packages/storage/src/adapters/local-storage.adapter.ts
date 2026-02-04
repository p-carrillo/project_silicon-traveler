import fs from 'fs/promises';
import path from 'path';
import { IStoragePort, StoredFile } from '../ports/storage.port';

export class LocalStorageAdapter implements IStoragePort {
  private readonly baseDir: string;
  private readonly baseUrl: string;

  constructor(baseDir?: string, baseUrl = '/images') {
    const resolvedBaseDir =
      baseDir || process.env.STORAGE_DIR || this.resolveDefaultBaseDir(process.cwd());

    this.baseDir = resolvedBaseDir;
    this.baseUrl = baseUrl;
  }

  async saveImage(buffer: Buffer, filename: string, date: Date): Promise<StoredFile> {
    const relativePath = this.buildPath(date, filename);
    const fullPath = path.join(this.baseDir, relativePath);

    await this.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, buffer);

    return {
      path: relativePath,
      url: `${this.baseUrl}/${relativePath}`,
    };
  }

  async saveThumbnail(buffer: Buffer, filename: string, suffix: string, date: Date): Promise<StoredFile> {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const thumbnailFilename = `${base}${suffix}${ext}`;

    return await this.saveImage(buffer, thumbnailFilename, date);
  }

  getImageUrl(relativePath: string): string {
    return `${this.baseUrl}/${relativePath}`;
  }

  async deleteImage(relativePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, relativePath);
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private buildPath(date: Date, filename: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}/${filename}`;
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private resolveDefaultBaseDir(cwd: string): string {
    const nested =
      cwd.includes(`${path.sep}apps${path.sep}`) || cwd.includes(`${path.sep}packages${path.sep}`);
    return path.resolve(cwd, nested ? path.join('..', '..', 'images') : 'images');
  }
}
