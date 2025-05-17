import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../../entities/user.entity'
import { v4 as uuidv4 } from 'uuid'

// 模拟UUID
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}))

describe('UsersService', () => {
  let service: UsersService

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)

    // 重置所有mock
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getOrCreateUser', () => {
    it('should return existing user when user exists', async () => {
      const uuid = 'existing-uuid'
      const existingUser = {
        id: 'existing-user-id',
        uuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserRepository.findOne.mockResolvedValue(existingUser)

      const result = await service.getOrCreateUser(uuid)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { uuid },
      })
      expect(mockUserRepository.create).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
      expect(result).toBe(existingUser)
    })

    it('should create and return new user when user does not exist', async () => {
      const uuid = 'new-uuid'
      const newUser = {
        id: uuidv4(),
        uuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue(newUser)

      const result = await service.getOrCreateUser(uuid)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { uuid },
      })
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        id: uuidv4(),
        uuid,
      })
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser)
      expect(result).toBe(newUser)
    })
  })
})
