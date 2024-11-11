// Libraries
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

// Decorators
import { User } from '@app/decorators';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import { PARAM_KEY, ROLE, ROUTES } from '@app/constants';

// Services
import { AccessService } from './share_access.service';

// Types
import { IdentifyId, UserRequest } from '@app/types';

// DTOs
import {
  ChangeOwnerDto,
  DeleteAccessDto,
  AccessCreateDto,
  AccessUpdateDto,
} from './dto';

@Controller(ROUTES.SHARE_ACCESS)
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @RequiresPermission(ROLE.VIEWER)
  @Get(`/permission/:${PARAM_KEY.OBJECT}`)
  getPermission(
    @User() user: UserRequest,
    @Param(PARAM_KEY.OBJECT) objectID: IdentifyId,
    @Query(PARAM_KEY.TYPE) objectType: string,
  ) {
    return this.accessService.findPermission(user.id, objectID, objectType);
  }

  @RequiresPermission(ROLE.VIEWER)
  @Post(`/create/:${PARAM_KEY.OBJECT}`)
  createAccess(
    @Param(PARAM_KEY.OBJECT) objectID: IdentifyId,
    @Query(PARAM_KEY.TYPE) objectType: string,
    @Body() shareData: AccessCreateDto,
    @User() user: UserRequest,
  ) {
    return this.accessService.createAccess(
      objectID,
      shareData.permissionList,
      user.id,
      objectType,
    );
  }

  @RequiresPermission(ROLE.VIEWER)
  @Get(`/accessList/:${PARAM_KEY.OBJECT}`)
  getUserAccessList(
    @Param(PARAM_KEY.OBJECT) objectID: IdentifyId,
    @Query(PARAM_KEY.TYPE) objectType: string,
  ) {
    return this.accessService.findUserAccessList(objectID, objectType);
  }

  @RequiresPermission(ROLE.EDITOR)
  @Put(`/update/:${PARAM_KEY.OBJECT}`)
  updateAccess(
    @Param(PARAM_KEY.OBJECT) objectID: IdentifyId,
    @Query(PARAM_KEY.TYPE) objectType: string,
    @Body() updateData: AccessUpdateDto,
    @User() user: UserRequest,
  ) {
    return this.accessService.updateAccess(
      objectID,
      updateData.permissionList,
      user.id,
      objectType,
    );
  }

  @RequiresPermission(ROLE.OWNER)
  @Put(`changeOwner/:${PARAM_KEY.OBJECT}`)
  changeOwner(
    @Param(PARAM_KEY.OBJECT) objectID: IdentifyId,
    @Query(PARAM_KEY.TYPE) objectType: string,
    @Body() changeData: ChangeOwnerDto,
    @User() current_owner: UserRequest,
  ) {
    return this.accessService.changeOwner(
      objectID,
      changeData.new_owner,
      current_owner.id,
      objectType,
    );
  }

  @RequiresPermission(ROLE.EDITOR)
  @Delete(`delete/:${PARAM_KEY.OBJECT}`)
  deleteAccess(
    @Param(PARAM_KEY.OBJECT) objectID: IdentifyId,
    @Query(PARAM_KEY.TYPE) objectType: string,
    @Body() deleteData: DeleteAccessDto,
  ) {
    return this.accessService.deleteAccess(objectID, deleteData.user_id);
  }
}
