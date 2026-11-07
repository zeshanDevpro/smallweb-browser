import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true, trim: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  name!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
