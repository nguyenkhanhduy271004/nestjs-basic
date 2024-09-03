import { InjectModel } from '@nestjs/mongoose';
import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { hashSync, compareSync } from 'bcryptjs'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { USER_ROLE } from 'src/databases/sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }

  genHashPassword = async (plainPassword: string) => {
    const saltRounds = 10;
    const hashPassword = hashSync(plainPassword, saltRounds);
    return hashPassword;

  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashPassword = await this.genHashPassword(createUserDto.password);
      const newUser = this.userModel.create({ ...createUserDto, password: hashPassword });
      return newUser;
    } catch (error) {
      console.log(error);
    }
  }

  async handleRegister(registerUserDto: RegisterUserDto) {
    try {
      const isExist = await this.userModel.findOne({ email: registerUserDto.email });
      if (isExist) {
        throw new BadGatewayException(`Email: ${registerUserDto.email} đã tồn tại trên hệ thống`);
      }

      const userRole = await this.roleModel.findOne({ name: USER_ROLE });
      const hashPassword = await this.genHashPassword(registerUserDto.password);
      const newUser = this.userModel.create({ ...registerUserDto, password: hashPassword, role: userRole?._id });
      return newUser;
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
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.userModel.find(filter)
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

  async findOne(id: string): Promise<any> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'Not found user';
      }
      const user = await this.userModel
        .findOne({ _id: id })
        .select('-password')
        .populate({ path: 'role', select: { name: 1, _id: 1 } });
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.userModel
        .findOne({ email: email })
        .populate({ path: 'role', select: { name: 1 } });
    } catch (error) {
      console.log(error);
    }
  }

  isValidPassword(plainPassword, hashPassword) {
    try {
      return compareSync(plainPassword, hashPassword);
    } catch (error) {
      console.log(error);
    }
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    try {
      const { id } = updateUserDto;
      return await this.userModel.updateOne({ _id: id }, { ...updateUserDto, updatedBy: { _id: user._id, email: user.email } });
    } catch (error) {
      console.log(error);

    }
  }

  async remove(id: string, user: IUser) {

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'Not found user';
      }
      const foundUser = await this.userModel.findById(id);
      if (foundUser && foundUser.email === "admin@gmail.com") {
        throw new BadRequestException('Không thể xóa tài khoản administrator')
      }
      await this.userModel.updateOne({ _id: id }, { deletedBy: { _id: user._id, email: user.email } })
      return await this.userModel.softDelete({ _id: id });
    } catch (error) {
      console.log(error);

    }
  }

  async updateUserToken(refreshToken: string, _id: string) {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  }

  async findUserByToken(refreshToken: string) {
    return await this.userModel.findOne({ refreshToken })
      .populate({
        path: 'role',
        select: { name: 1 }
      })
  }

  async handleGetAccount(user: IUser) {
    return {
      user: user
    }
  }

}
