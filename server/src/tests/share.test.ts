import { ShareService } from '../services/ShareService';
import { ExpiryType } from '../entities/Share';
import { AppDataSource } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    getRepository: jest.fn(),
  };
});

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
  initializeDatabase: jest.fn(),
}));

describe('ShareService', () => {
  let shareService: ShareService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟目录存在
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // 模拟文件读写
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ test: 'data' }));
    
    // 模拟数据库仓库
    mockRepository = {
      save: jest.fn((share) => Promise.resolve({ ...share, id: 'mock-uuid' })),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    
    shareService = new ShareService();
  });

  describe('createShare', () => {
    it('should create a share with one day expiry', async () => {
      const result = await shareService.createShare(
        'test-user',
        'test.json',
        JSON.stringify({ test: 'data' }),
        ExpiryType.ONE_DAY
      );

      expect(result).toHaveProperty('id', 'mock-uuid');
      expect(result.expiryType).toBe(ExpiryType.ONE_DAY);
      expect(result.expiresAt).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should create a share with seven days expiry', async () => {
      const result = await shareService.createShare(
        'test-user',
        'test.json',
        JSON.stringify({ test: 'data' }),
        ExpiryType.SEVEN_DAYS
      );

      expect(result).toHaveProperty('id', 'mock-uuid');
      expect(result.expiryType).toBe(ExpiryType.SEVEN_DAYS);
      expect(result.expiresAt).toBeDefined();
    });

    it('should create a share with permanent expiry', async () => {
      const result = await shareService.createShare(
        'test-user',
        'test.json',
        JSON.stringify({ test: 'data' }),
        ExpiryType.PERMANENT
      );

      expect(result).toHaveProperty('id', 'mock-uuid');
      expect(result.expiryType).toBe(ExpiryType.PERMANENT);
      expect(result.expiresAt).toBeNull();
    });
  });

  describe('getShareById', () => {
    it('should return null if share not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await shareService.getShareById('not-exist');
      expect(result).toBeNull();
    });

    it('should return null if share is expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      mockRepository.findOne.mockResolvedValue({
        id: 'expired-id',
        expiresAt: pastDate,
        isDeleted: false
      });
      
      const result = await shareService.getShareById('expired-id');
      expect(result).toBeNull();
    });

    it('should return share if valid', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const mockShare = {
        id: 'valid-id',
        expiresAt: futureDate,
        isDeleted: false
      };
      
      mockRepository.findOne.mockResolvedValue(mockShare);
      
      const result = await shareService.getShareById('valid-id');
      expect(result).toEqual(mockShare);
    });
  });

  describe('getUserShares', () => {
    it('should return user shares', async () => {
      const mockShares = [
        { id: 'share1', userId: 'test-user' },
        { id: 'share2', userId: 'test-user' }
      ];
      
      mockRepository.find.mockResolvedValue(mockShares);
      
      const result = await shareService.getUserShares('test-user');
      expect(result).toEqual(mockShares);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          userId: 'test-user',
          isDeleted: false
        },
        order: {
          createdAt: 'DESC'
        }
      });
    });
  });

  describe('deleteShare', () => {
    it('should return false if share not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await shareService.deleteShare('not-exist', 'test-user');
      expect(result).toBe(false);
    });

    it('should mark share as deleted', async () => {
      const mockShare = {
        id: 'share-id',
        userId: 'test-user',
        isDeleted: false
      };
      
      mockRepository.findOne.mockResolvedValue(mockShare);
      mockRepository.save.mockResolvedValue({ ...mockShare, isDeleted: true });
      
      const result = await shareService.deleteShare('share-id', 'test-user');
      expect(result).toBe(true);
      expect(mockShare.isDeleted).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(mockShare);
    });
  });
}); 