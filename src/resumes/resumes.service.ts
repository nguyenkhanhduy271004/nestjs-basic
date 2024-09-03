import { Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) { }

  async create(createResumeDto: CreateResumeDto, user: IUser) {
    try {
      return await this.resumeModel.create({
        ...createResumeDto,
        email: user.email,
        userId: user._id,
        status: 'PENDING',
        history: [{
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }],
        createdBy: {
          _id: user._id,
          email: user.email
        }
      })
    } catch (error) {
      console.log(error);

    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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

  findOne(id: string) {
    return this.resumeModel.findOne({ _id: id });
  }

  async findResumeByUserId(user: IUser) {

    return await this.resumeModel.find({
      userId: user._id,
    })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ])

  }

  async update(id: string, status: string, user: IUser) {

    try {
      return await this.resumeModel.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { status, updatedBy: { _id: user._id, email: user.email } },
          $push: {
            history: {
              status: status,
              updatedAt: new Date(),
              updatedBy: {
                _id: user._id,
                email: user.email,
              },
            },
          },
        },
      );
    } catch (error) {
      console.error('Error updating resume:', error.message);
      throw new Error('Failed to update resume');
    }
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.resumeModel.softDelete({ _id: id });
  }
}
