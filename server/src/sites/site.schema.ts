import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ timestamps: true })
export class Site {
  @Prop({ required: true, unique: true, index: true })
  address!: string;

  @Prop({ required: true, minlength: 1, maxlength: 120 })
  title!: string;

  @Prop({ required: true })
  body!: string;

  // Keeping prose separate makes text search ignore markup and attributes.
  @Prop({ required: true })
  text!: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  authorId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ title: 'text', text: 'text' }, { weights: { title: 10, text: 1 } });
