import { Test, TestingModule } from '@nestjs/testing';
import { SharesService } from './shares.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Share } from '../../entities/share.entity';
import { UsersService } from '../users/users.service';
import { FilesService } from '../files/files.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateShareDto } from './dto/create-share.dto';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

// 模拟UUID和nanoid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-share-id'),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('test-code'),
}));

describe('SharesService', () => {
  let service: SharesService;

  const mockSharesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersService = {
    getOrCreateUser: jest.fn(),
  };

  const mockFilesService = {
    findById: jest.fn(),
    getFileContent: jest.fn(),
    getFileBuffer: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharesService,
        {
          provide: getRepositoryToken(Share),
          useValue: mockSharesRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<SharesService>(SharesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShare', () => {
    it('should create a share with day expiry', async () => {
      const user = { id: 'user-id', uuid: 'user-uuid' };
      const file = { id: 'file-id', fileName: 'test.json' };
      const dto: CreateShareDto = { fileId: file.id, expiryType: 'day' };

      // 模拟当前日期为2023-01-01
      const now = new Date('2023-01-01');

      // 计算预期的过期日期：2023-01-02
      const expectedExpiresAt = new Date('2023-01-02');

      const createdShare = {
        id: uuidv4(),
        shareCode: nanoid(8),
        userId: user.id,
        jsonFileId: file.id,
        expiresAt: expectedExpiresAt,
        status: 1,
      };
      const createdShareResponse = { ...createdShare, createdAt: now };

      mockUsersService.getOrCreateUser.mockResolvedValue(user);
      mockFilesService.findById.mockResolvedValue(file);
      jest.spyOn(global, 'Date').mockImplementation(() => now);
      mockSharesRepository.create.mockReturnValue(createdShareResponse);
      mockSharesRepository.save.mockResolvedValue(createdShareResponse);

      const result = await service.createShare(user.uuid, dto);

      expect(mockUsersService.getOrCreateUser).toHaveBeenCalledWith(user.uuid);
      expect(mockFilesService.findById).toHaveBeenCalledWith(file.id);
      expect(mockSharesRepository.create).toHaveBeenCalledWith(createdShare);
      expect(mockSharesRepository.save).toHaveBeenCalledWith(createdShareResponse);

      expect(result).toEqual({
        id: uuidv4(),
        shareCode: nanoid(8),
        fileName: 'test.json',
        expiresAt: expectedExpiresAt,
        status: 1,
        createdAt: now,
      });

      // 恢复Date的原始实现
      jest.spyOn(global, 'Date').mockRestore();
    });

    it('should create a share with week expiry', async () => {
      const user = { id: 'user-id', uuid: 'user-uuid' };
      const file = { id: 'file-id', fileName: 'test.json' };
      const dto: CreateShareDto = { fileId: file.id, expiryType: 'week' };

      // 模拟当前日期为2023-01-01
      const now = new Date('2023-01-01');

      // 计算预期的过期日期：2023-01-08
      const expectedExpiresAt = new Date('2023-01-08');

      const createdShare = {
        id: uuidv4(),
        shareCode: nanoid(8),
        userId: user.id,
        jsonFileId: file.id,
        expiresAt: expectedExpiresAt,
        status: 1,
      };

      mockUsersService.getOrCreateUser.mockResolvedValue(user);
      mockFilesService.findById.mockResolvedValue(file);
      jest.spyOn(global, 'Date').mockImplementation(() => now);
      mockSharesRepository.create.mockReturnValue(createdShare);
      mockSharesRepository.save.mockResolvedValue(createdShare);

      const result = await service.createShare(user.uuid, dto);

      expect(mockSharesRepository.create).toHaveBeenCalledWith(createdShare);
      expect(result.expiresAt).toEqual(expectedExpiresAt);

      // 恢复Date的原始实现
      jest.spyOn(global, 'Date').mockRestore();
    });

    it('should create a permanent share', async () => {
      const user = { id: 'user-id', uuid: 'user-uuid' };
      const file = { id: 'file-id', fileName: 'test.json' };
      const dto: CreateShareDto = { fileId: file.id, expiryType: 'permanent' };
      const now = new Date('2023-01-01');

      const createdShare = {
        id: uuidv4(),
        shareCode: nanoid(8),
        userId: user.id,
        jsonFileId: file.id,
        expiresAt: null,
        status: 1,
      };
      const createdShareResponse = { ...createdShare, createdAt: now };

      mockUsersService.getOrCreateUser.mockResolvedValue(user);
      mockFilesService.findById.mockResolvedValue(file);
      mockSharesRepository.create.mockReturnValue(createdShareResponse);
      mockSharesRepository.save.mockResolvedValue(createdShareResponse);

      const result = await service.createShare(user.uuid, dto);

      expect(mockSharesRepository.create).toHaveBeenCalledWith(createdShare);
      expect(result.expiresAt).toBeNull();
    });
  });

  describe('findUserShares', () => {
    it('should return all shares for a user', async () => {
      const user = { id: 'user-id', uuid: 'user-uuid' };
      const shares = [
        {
          id: 'share-1',
          shareCode: 'code1',
          userId: 'user-id',
          jsonFileId: 'file-1',
          jsonFile: { fileName: 'file1.json' },
          expiresAt: new Date('2023-01-02'),
          status: 1,
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'share-2',
          shareCode: 'code2',
          userId: 'user-id',
          jsonFileId: 'file-2',
          jsonFile: { fileName: 'file2.json' },
          expiresAt: null,
          status: 1,
          createdAt: new Date('2023-01-01'),
        },
      ];

      mockUsersService.getOrCreateUser.mockResolvedValue(user);
      mockSharesRepository.find.mockResolvedValue(shares);

      const result = await service.findUserShares(user.uuid);

      expect(mockUsersService.getOrCreateUser).toHaveBeenCalledWith(user.uuid);
      expect(mockSharesRepository.find).toHaveBeenCalledWith({
        where: { userId: user.id, status: 1 },
        relations: ['jsonFile'],
        order: { createdAt: 'DESC' },
      });

      expect(result).toEqual([
        {
          id: shares[0].id,
          shareCode: shares[0].shareCode,
          fileName: shares[0].jsonFile.fileName,
          expiresAt: shares[0].expiresAt,
          status: shares[0].status,
          createdAt: shares[0].createdAt,
        },
        {
          id: shares[1].id,
          shareCode: shares[1].shareCode,
          fileName: shares[1].jsonFile.fileName,
          expiresAt: shares[1].expiresAt,
          status: shares[1].status,
          createdAt: shares[1].createdAt,
        },
      ]);
    });
  });

  describe('deleteShare', () => {
    it('should throw NotFoundException if share does not exist', async () => {
      const user = { id: 'user-id', uuid: 'user-uuid' };
      const shareId = 'non-existent-id';

      mockUsersService.getOrCreateUser.mockResolvedValue(user);
      mockSharesRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteShare(user.uuid, shareId)).rejects.toThrow(new NotFoundException('分享不存在'));

      expect(mockUsersService.getOrCreateUser).toHaveBeenCalledWith(user.uuid);
      expect(mockSharesRepository.findOne).toHaveBeenCalledWith({
        where: { id: shareId },
      });
    });

    it('should throw ForbiddenException if user does not own the share', async () => {
      const user = { id: 'user-id', uuid: 'user-uuid' };
      const share = {
        id: 'share-id',
        userId: 'other-user-id', // 不同的用户ID
        status: 1,
      };

      mockUsersService.getOrCreateUser.mockResolvedValue(user);
      mockSharesRepository.findOne.mockResolvedValue(share);

      await expect(service.deleteShare('user-uuid', 'share-id')).rejects.toThrow(ForbiddenException);

      expect(mockUsersService.getOrCreateUser).toHaveBeenCalledWith('user-uuid');
      expect(mockSharesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'share-id' },
      });
      expect(mockSharesRepository.save).not.toHaveBeenCalled();
    });

    it('should soft delete the share', async () => {
      const user = { id: 'user-id', uuid: 'user-uuid' };
      const share = {
        id: 'share-id',
        userId: 'user-id', // 相同的用户ID
        status: 1,
      };

      mockUsersService.getOrCreateUser.mockResolvedValue(user);
      mockSharesRepository.findOne.mockResolvedValue(share);
      mockSharesRepository.save.mockResolvedValue({ ...share, status: 0 });

      await service.deleteShare('user-uuid', 'share-id');

      expect(mockUsersService.getOrCreateUser).toHaveBeenCalledWith('user-uuid');
      expect(mockSharesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'share-id' },
      });
      expect(share.status).toBe(0); // 验证状态被修改
      expect(mockSharesRepository.save).toHaveBeenCalledWith(share);
    });
  });

  describe('findByShareCode', () => {
    it('should throw NotFoundException if share does not exist', async () => {
      const shareCode = 'non-existent-code';
      mockSharesRepository.findOne.mockResolvedValue(null);

      await expect(service.findByShareCode(shareCode)).rejects.toThrow(new NotFoundException('分享不存在或已失效'));

      expect(mockSharesRepository.findOne).toHaveBeenCalledWith({
        where: { shareCode, status: 1 },
        relations: ['jsonFile'],
      });
    });

    it('should throw BadRequestException if share is expired', async () => {
      const shareCode = 'test-code';
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const share = {
        id: 'share-id',
        shareCode,
        expiresAt: yesterday, // 过期的日期
        status: 1,
      };

      mockSharesRepository.findOne.mockResolvedValue(share);

      await expect(service.findByShareCode(shareCode)).rejects.toThrow(new BadRequestException('分享已过期'));

      expect(mockSharesRepository.findOne).toHaveBeenCalledWith({
        where: { shareCode, status: 1 },
        relations: ['jsonFile'],
      });
    });

    it('should return share if it exists and is not expired', async () => {
      const shareCode = 'test-code';
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const share = {
        id: 'share-id',
        shareCode,
        expiresAt: tomorrow, // 未过期的日期
        status: 1,
      };

      mockSharesRepository.findOne.mockResolvedValue(share);

      const result = await service.findByShareCode(shareCode);

      expect(mockSharesRepository.findOne).toHaveBeenCalledWith({
        where: { shareCode, status: 1 },
        relations: ['jsonFile'],
      });
      expect(result).toBe(share);
    });

    it('should return permanent share', async () => {
      const shareCode = 'test-code';
      const share = {
        id: 'share-id',
        shareCode,
        expiresAt: null, // 永久有效
        status: 1,
      };

      mockSharesRepository.findOne.mockResolvedValue(share);

      const result = await service.findByShareCode(shareCode);

      expect(mockSharesRepository.findOne).toHaveBeenCalledWith({
        where: { shareCode, status: 1 },
        relations: ['jsonFile'],
      });
      expect(result).toBe(share);
    });
  });

  describe('getJsonContentByShareCode', () => {
    it('should return JSON content for valid share', async () => {
      const share = {
        id: 'share-id',
        shareCode: 'test-code',
        jsonFileId: 'file-id',
        expiresAt: null,
        status: 1,
      };

      const jsonContent = { test: 'data' };

      mockSharesRepository.findOne.mockResolvedValue(share);
      mockFilesService.getFileContent.mockResolvedValue(jsonContent);

      const result = await service.getJsonContentByShareCode(share.shareCode);

      expect(mockSharesRepository.findOne).toHaveBeenCalled();
      expect(mockFilesService.getFileContent).toHaveBeenCalledWith(share.jsonFileId);
      expect(result).toEqual(jsonContent);
    });
  });

  describe('getFileBufferByShareCode', () => {
    it('should return file buffer and filename for valid share', async () => {
      const share = {
        id: 'share-id',
        shareCode: 'test-code',
        jsonFileId: 'file-id',
        jsonFile: { fileName: 'test.json' },
        expiresAt: null,
        status: 1,
      };

      const buffer = Buffer.from('file content');

      mockSharesRepository.findOne.mockResolvedValue(share);
      mockFilesService.getFileBuffer.mockResolvedValue(buffer);

      const result = await service.getFileBufferByShareCode(share.shareCode);

      expect(mockSharesRepository.findOne).toHaveBeenCalled();
      expect(mockFilesService.getFileBuffer).toHaveBeenCalledWith(share.jsonFileId);
      expect(result).toEqual({
        buffer,
        fileName: share.jsonFile.fileName,
      });
    });
  });
});
