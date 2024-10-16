// Libraries
import { Controller } from '@nestjs/common';
import { AccessService } from './share_access.service';

// // Entities
// import { GroupEntity } from './group.entity';
// import { UserEntity } from '../user/user.entity';

// // Services
// import { GroupService } from './group.service';

// // Types
// import { IdentifyId } from '@app/types';

// // Decorators
// import { User } from '@app/decorators';

@Controller('share-access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}
}
