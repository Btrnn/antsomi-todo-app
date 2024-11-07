// Libraries
import { SetMetadata } from '@nestjs/common';

// Constants
import {
  OBJECT_KEY,
  OBJECT_TYPE,
  PERMISSION,
  PERMISSION_KEY,
} from '@app/constants';

export const RequiresPermission =
  (
    permission: keyof typeof PERMISSION,
    objectType?: (typeof OBJECT_TYPE)[keyof typeof OBJECT_TYPE],
  ): MethodDecorator =>
  (target, key, descriptor) => {
    SetMetadata(PERMISSION_KEY, permission)(target, key, descriptor);
    SetMetadata(OBJECT_KEY, objectType)(target, key, descriptor);
    return descriptor;
  };
