import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    try {
      if (!(await existsAsync(this.uploadDir))) {
        await mkdirAsync(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      console.error('创建上传目录失败:', error);
      throw new InternalServerErrorException('无法创建上传目录');
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

    if (!file.originalname.toLowerCase().endsWith('.json')) {
      throw new BadRequestException('文件必须是JSON格式');
    }

    // 验证文件是否为JSON
    try {
      JSON.parse(file.buffer.toString());
    } catch {
      throw new BadRequestException('文件内容不是有效的JSON格式');
    }

    const fileId = uuidv4();
    const fileName = file.originalname;
    const fileSize = file.size;
    const filePath = path.join(this.uploadDir, `${fileId}.json`);

    try {
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
    } catch (error) {
      // 如果保存文件时出错，尝试删除已创建的文件
      try {
        if (await existsAsync(filePath)) {
          await unlinkAsync(filePath);
        }
      } catch (cleanupError) {
        console.error('清理错误:', cleanupError);
      }

      console.error('保存文件失败:', error);
      throw new InternalServerErrorException('保存文件失败');
    }
  }

  /**
   * 根据ID获取文件
   * @param id 文件ID
   * @returns 文件实体
   */
  async findById(id: string): Promise<JsonFile> {
    if (!id) {
      throw new BadRequestException('文件ID不能为空');
    }

    const file = await this.jsonFilesRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`文件不存在: ${id}`);
    }

    // 验证文件是否在磁盘上存在
    if (!(await existsAsync(file.filePath))) {
      throw new NotFoundException(`文件在磁盘上不存在: ${id}`);
    }

    return file;
  }

  /**
   * 读取文件内容
   * @param id 文件ID
   * @returns JSON内容
   */
  async getFileContent(id: string): Promise<unknown> {
    const file = await this.findById(id);
    try {
      const content = await readFileAsync(file.filePath, { encoding: 'utf8' });
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException(`文件不是有效的JSON格式: ${id}`);
      }
      console.error('读取文件内容失败:', error);
      throw new InternalServerErrorException('读取文件内容失败');
    }
  }

  /**
   * 获取文件Buffer
   * @param id 文件ID
   * @returns 文件Buffer
   */
  async getFileBuffer(id: string): Promise<Buffer> {
    const file = await this.findById(id);
    try {
      return readFileAsync(file.filePath);
    } catch (error) {
      console.error('读取文件Buffer失败:', error);
      throw new InternalServerErrorException('读取文件失败');
    }
  }
}
