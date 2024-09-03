import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubscriberDocument = HydratedDocument<Subscriber>;

@Schema({ timestamps: true })
export class Subscriber {
    @Prop({ required: true })
    email: string;

    @Prop()
    name: string;

    @Prop({ type: mongoose.Schema.Types.Array })
    skills: string[];

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    deletedAt: Date;

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

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
