import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) { }
  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const isExistEmail = await this.subscriberModel.findOne({ email: createSubscriberDto.email });

    if (isExistEmail) {
      throw new BadRequestException(`Email: ${createSubscriberDto.email} đã tồn tại trên hệ thống`);
    }
    return await this.subscriberModel.create({
      ...createSubscriberDto, createdBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async getSkills(user: IUser) {
    return await this.subscriberModel.findOne({ email: user.email }, { skills: 1 })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.subscriberModel.find(filter)
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID subscriber không hợp lệ')
    }
    return await this.subscriberModel.findOne({ _id: id });
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    await this.subscriberModel.updateOne({ email: user.email }, {
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.subscriberModel.updateOne({ email: user.email }, { ...updateSubscriberDto }, { upsert: true });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID subscriber không hợp lệ')
    }
    await this.subscriberModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.subscriberModel.softDelete({ _id: id });
  }
}
