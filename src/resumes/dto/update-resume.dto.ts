import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import mongoose from 'mongoose';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {

    status?: string;
}
