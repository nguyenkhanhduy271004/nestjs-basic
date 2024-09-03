import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {

    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    skills: string[]
}
