import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
    @Prop()
    name: string;

    @Prop()
    skills: string[];

    @Prop()
    salary: number;

    @Prop()
    quantity: number;

    @Prop()
    level: string;

    @Prop()
    description: string;

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop()
    isActive: boolean;

    @Prop()
    location: string;

    @Prop({ type: Object })
    company: {
        _id: mongoose.Schema.Types.ObjectId,
        name: string,
        logo: string
    }

    @Prop({ type: Object })
    createdBy: {
        _id: string;
        email: string;
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: string;
        email: string;
    };

    @Prop({ type: Object })
    deletedBy: {
        _id: string;
        email: string;
    };
}

export const JobSchema = SchemaFactory.createForClass(Job);
