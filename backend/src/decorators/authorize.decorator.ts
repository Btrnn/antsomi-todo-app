// Libraries
import { CustomDecorator, SetMetadata } from '@nestjs/common';

// Constants
import {
  ACCESS_OBJECT,
  OBJECT_KEY,
  PERMISSION,
  PERMISSION_KEY,
} from '@app/constants';

export const RequiresPermission =
  (permission: keyof typeof PERMISSION, object: string): MethodDecorator =>
  (target, key, descriptor) => {
    SetMetadata(PERMISSION_KEY, permission)(target, key, descriptor);
    SetMetadata(OBJECT_KEY, object)(target, key, descriptor);
    return descriptor;
  };
