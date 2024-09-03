import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    try {
      return await this.jobModel.create({ ...createJobDto, isActive: true, createdBy: { _id: user._id, email: user.email } });
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.jobModel.find(filter)
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
    return await this.jobModel.findOne({ _id: id });
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    try {
      return await this.jobModel.updateOne({ _id: id }, { ...updateJobDto, updatedBy: { _id: user._id, email: user.email } });
    } catch (error) {
      console.log(error);
    }
  }

  async remove(id: string, user: IUser) {
    try {
      await this.jobModel.updateOne({ _id: id }, { deletedBy: { _id: user._id, email: user.email } })
      return await this.jobModel.softDelete({ _id: id })
    } catch (error) {
      console.log(error);
    }
  }
}
