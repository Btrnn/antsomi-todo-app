// Libraries
import { SetMetadata } from '@nestjs/common';

// Constants
import { IS_PUBLIC_KEY } from '@app/constants';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
