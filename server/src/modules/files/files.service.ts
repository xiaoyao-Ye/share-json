import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonFile } from '../../entities/json-file.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(JsonFile)
    private jsonFilesRepository: Repository<JsonFile>,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private async ensureUploadDir(): Promise<void> {
    if (!(await existsAsync(this.uploadDir))) {
      await mkdirAsync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 上传JSON文件
   * @param file 文件对象
   * @returns 保存的文件实体
   */
  async uploadJsonFile(file: Express.Multer.File): Promise<JsonFile> {
    if (!file) {
      throw new BadRequestException('未提供文件');
    }

    // 验证文件是否为JSON
    try {
      JSON.parse(file.buffer.toString());
    } catch (e) {
      throw new BadRequestException('文件不是有效的JSON格式');
    }

    const fileId = uuidv4();
    const fileName = file.originalname;
    const fileSize = file.size;
    const filePath = path.join(this.uploadDir, `${fileId}.json`);

    // 保存文件到磁盘
    await writeFileAsync(filePath, file.buffer);

    // 创建数据库记录
    const jsonFile = this.jsonFilesRepository.create({
      id: fileId,
      fileName,
      filePath,
      fileSize,
    });

    return this.jsonFilesRepository.save(jsonFile);
  }

  /**
   * 根据ID获取文件
   * @param id 文件ID
   * @returns 文件实体
   */
  async findById(id: string): Promise<JsonFile> {
    const file = await this.jsonFilesRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }
    return file;
  }

  /**
   * 读取文件内容
   * @param id 文件ID
   * @returns JSON内容
   */
  async getFileContent(id: string): Promise<any> {
    const file = await this.findById(id);
    const content = await readFileAsync(file.filePath, { encoding: 'utf8' });
    return JSON.parse(content);
  }

  /**
   * 获取文件Buffer
   * @param id 文件ID
   * @returns 文件Buffer
   */
  async getFileBuffer(id: string): Promise<Buffer> {
    const file = await this.findById(id);
    return readFileAsync(file.filePath);
  }
}
