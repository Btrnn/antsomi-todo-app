// Libraries
import { Controller } from '@nestjs/common';

// Services
import { AccessService } from './share_access.service';

// Constants
import { ROUTES } from '@app/constants';

@Controller(ROUTES.SHARE_ACCESS)
export class AccessController {
  constructor(private readonly accessService: AccessService) {}
}
