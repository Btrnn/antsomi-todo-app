import { Module } from '@nestjs/common';
import { AccessController } from './share_access.controller';
import { AccessService } from './share_access.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessEntity } from './share_access.entity';
import { AccessRepository } from './share_access.repository';

@Module({
  exports: [AccessService],
  imports: [TypeOrmModule.forFeature([AccessEntity])],
  controllers: [AccessController],
  providers: [TypeOrmModule, AccessService, AccessRepository],
})
export class BoardUserModule {}
