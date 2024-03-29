import { FC } from "react";
import Comment from "./Comment";
import { CommentInfo } from "@/global/Post.types";

interface Props {
  comments: CommentInfo[];
  focusedComment?: string;
};

const Comments: FC<Props> = ({ comments, focusedComment }) => {
  const isFocusReply = focusedComment?.includes("%26replies")
  const focusedCommentId = focusedComment?.replace("%26replies", "")

  return (
    <div>
      {comments.map((comment) => {
        return (
          <div key={comment.id}>
            <Comment comment={comment} focused={(comment.id === focusedCommentId) ? (isFocusReply ? "replies" : "comment") : "none"} />
          </div>
        )
      })}
    </div>
  );
};

export default Comments;