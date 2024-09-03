import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {

  constructor(
    @InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) { }

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const isExist = await this.permissionModel.findOne({ apiPath: createPermissionDto.apiPath, method: createPermissionDto.method });

    if (isExist) {
      throw new BadRequestException("Permission is already exist");
    }
    return await this.permissionModel.create({
      ...createPermissionDto, createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.permissionModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    return await this.permissionModel.findOne({ _id: id });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    return await this.permissionModel.updateOne({ _id: id }, {
      ...updatePermissionDto, updatedBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async remove(id: string, user: IUser) {
    await this.permissionModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.permissionModel.softDelete({ _id: id });
  }
}
