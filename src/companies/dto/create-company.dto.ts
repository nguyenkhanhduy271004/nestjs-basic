import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateCompanyDto {

    @IsNotEmpty({ message: 'Vui lòng nhập tên' })
    name: string;

    @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
    address: string;

    @IsNotEmpty({ message: 'Vui lòng nhập miêu tả' })
    description: string;

    @IsNotEmpty({ message: 'Vui lòng thêm logo công ty' })
    logo: string;
}
