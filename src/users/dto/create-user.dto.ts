import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";



class Company {

    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {

    @IsNotEmpty({ message: 'Vui lòng nhập tên' })
    name: string;

    @IsEmail({}, { message: 'Vui lòng nhập đúng định dạng email' })
    @IsNotEmpty({ message: 'Vui lòng nhập email' })
    email: string;

    @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
    password: string;

    @IsNotEmpty({ message: 'Vui lòng nhập tuổi' })
    age: number;

    @IsNotEmpty({ message: 'Vui lòng nhập giới tính' })
    gender: string;

    @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
    address: string;

    @IsNotEmpty({ message: 'Vui lòng nhập role' })
    @IsMongoId({ message: 'Role có định dạng mongoId' })
    role: string;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}

export class RegisterUserDto {

    @IsNotEmpty({ message: 'Vui lòng nhập tên' })
    name: string;

    @IsEmail({}, { message: 'Vui lòng nhập đúng định dạng email' })
    @IsNotEmpty({ message: 'Vui lòng nhập email' })
    email: string;

    @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
    password: string;

    @IsNotEmpty({ message: 'Vui lòng nhập tuổi' })
    age: number;

    @IsNotEmpty({ message: 'Vui lòng nhập giới tính' })
    gender: string;

    @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
    address: string;
}

export class UserLoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'nguyenduy', description: 'username' })
    readonly username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123456',
        description: 'password',
    })

    readonly password: string;
}
