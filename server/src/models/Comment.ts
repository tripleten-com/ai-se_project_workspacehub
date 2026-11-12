import { Schema, model, Types, type InferSchemaType } from "mongoose";

const commentSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type CommentDocument = InferSchemaType<typeof commentSchema> & {
  _id: Types.ObjectId;
};

export const Comment = model<CommentDocument>("Comment", commentSchema);
