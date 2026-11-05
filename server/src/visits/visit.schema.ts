import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import type { Via } from '../common/via';

export type VisitDocument = HydratedDocument<Visit>;

@Schema()
export class Visit {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  address!: string;

  @Prop({
    required: true,
    enum: ['typed', 'link', 'back', 'forward', 'history', 'search'],
  })
  via!: Via;

  @Prop({ required: true })
  found!: boolean;

  @Prop({ required: true, default: Date.now })
  at!: Date;

  @Prop({ unique: true, sparse: true })
  seedKey?: string;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ userId: 1, at: -1 });
