import { Type } from "class-transformer";
import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsMongoId,
    IsNotEmpty,
    IsNotEmptyObject,
    IsObject,
    ValidateNested
} from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsMongoId()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: 'Vui lòng nhập tên công ty' })
    name: string;

    @IsNotEmpty({ message: 'Vui lòng nhập skills' })
    skills: string[];

    @IsNotEmpty({ message: 'Vui lòng nhập lương' })
    salary: number;

    @IsNotEmpty({ message: 'Vui lòng nhập số lượng' })
    quantity: number;

    @IsNotEmpty({ message: 'Vui lòng nhập cấp độ' })
    level: string;

    @IsNotEmpty({ message: 'Vui lòng nhập mô tả' })
    description: string;

    @IsNotEmpty({ message: 'Vui lòng ngày bắt đầu' })
    startDate: Date;

    @IsNotEmpty({ message: 'Vui lòng ngày kết thúc' })
    endDate: Date;

    @IsNotEmpty({ message: 'Vui lòng ngày địa điểm' })
    location: string;

    @IsBoolean()
    isActive: boolean;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}
