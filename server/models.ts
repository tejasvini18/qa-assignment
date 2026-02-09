import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'editor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'editor', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

// Item Schema
export interface IItem extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  views: number;
  likes: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Item = mongoose.model<IItem>('Item', itemSchema);

// Audit Log Schema
export interface IAuditLog extends Document {
  action: string;
  userId: mongoose.Types.ObjectId;
  itemId?: mongoose.Types.ObjectId;
  details: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

// Refresh Token Schema (for token rotation)
export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
