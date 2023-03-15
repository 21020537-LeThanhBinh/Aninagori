'use client'

import { getDocs, collection, query, orderBy, getDoc, doc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";

import PostContent from "./PostContent";
import { db } from "@/firebase/firebase-app";
import PostAction from "./PostAction"
import { formatDuration } from "../utils/formatDuration";
import Modal from "../utils/Modal";
import { PostContext } from "./context/PostContex";

export default function PostPopup({ isOpen, onClose }: { isOpen: boolean, onClose: any }) {
  const [post, setPost] = useState<any>({})
  const { myUserInfo, postId } = useContext(PostContext)

  useEffect(() => {
    async function fetchData() {
      const postDoc = await getDoc(doc(db, "posts", postId))
      if (!postDoc.exists()) return;

      const commentsRef = collection(postDoc.ref, "comments")
      const commentsQuery = query(commentsRef, orderBy("timestamp", "asc"))

      const commentsData = (await getDocs(commentsQuery)).docs
      const commentCount = commentsData.length

      const comments = commentsData.map(doc => {
        return {
          ...doc.data(),
          timestamp: formatDuration(new Date().getTime() - doc.data().timestamp.toDate().getTime()),
          id: doc.id
        }
      })

      setPost({
        ...postDoc.data(),
        timestamp: formatDuration(new Date().getTime() - postDoc.data().timestamp.toDate().getTime()),
        commentCount: commentCount,
        comments: comments,
      } as any)
    }

    fetchData()
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={""}>
      <div className="w-[600px]" >
        <PostContent
          authorName={post.authorName}
          avatarUrl={post.avatarUrl}
          timestamp={post.timestamp}
          content={post.content}
          imageUrl={post.imageUrl}
          videoUrl={post.videoUrl}
          id={postId}
        />
        <PostAction
          myUserInfo={myUserInfo}
          reactions0={post.reactions}
          commentCount={post.commentCount}
          comments={post.comments}
          id={postId}
        />
      </div>
    </Modal >
  );
}