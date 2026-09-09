import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { UPLOADS_DIR } from '../common/paths';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_FILE_SIZE = 2 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly uploadDir = UPLOADS_DIR;

  saveImage(file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('请上传图片');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('图片大小不能超过 2MB');
    }

    const extension = extname(file.originalname).toLowerCase();
    if (
      !ALLOWED_EXTENSIONS.has(extension) ||
      !ALLOWED_MIME_TYPES.has(file.mimetype)
    ) {
      throw new BadRequestException('仅支持 jpg、jpeg、png、webp 格式');
    }

    this.ensureUploadDir();

    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}${extension}`;
    const filepath = join(this.uploadDir, filename);

    writeFileSync(filepath, file.buffer);

    return `/uploads/${filename}`;
  }

  private ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }
}
