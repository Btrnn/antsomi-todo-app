// Libraries
import { Test, TestingModule } from '@nestjs/testing';

// Services
import { TaskService } from './task.service';

describe('TasksService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});