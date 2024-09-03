import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>) { }

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    try {
      return await this.companyModel.create({
        ...createCompanyDto,
        createdBy: {
          _id: user._id,
          email: user.email
        }
      });
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
    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.companyModel.find(filter)
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
      throw new BadRequestException(`Not found company with id=${id}`)
    }
    return await this.companyModel.findOne({ _id: id })
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'Not found Company';
      }
      return await this.companyModel.updateOne(
        { _id: id },
        {
          ...updateCompanyDto,
          updatedBy:
          {
            _id: user._id,
            email: user.email
          }
        })
    } catch (error) {
      console.log(error);
    }
  }

  async remove(id: string, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'Not found Company';
      }
      await this.companyModel.updateOne({ _id: id },
        {
          deletedBy:
          {
            _id: user._id,
            email: user.email
          }
        })
      return await this.companyModel.softDelete({ _id: id })
    } catch (error) {

    }
  }
}
