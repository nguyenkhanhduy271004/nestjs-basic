import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {

    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    @IsMongoId()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    jobId: mongoose.Schema.Types.ObjectId;

    status: string;

}
