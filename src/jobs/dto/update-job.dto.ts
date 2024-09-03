import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {

    name?: string;
    skills?: string[];
    salary?: number;
    quantity?: number;
    level?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    location?: string;
}
