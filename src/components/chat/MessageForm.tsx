'use client'

import { collection, serverTimestamp, doc, addDoc } from "firebase/firestore";
import { FC, useContext, useState, useRef } from "react";
import { db } from "@/firebase/firebase-app";
import Avatar from "../avatar/Avatar";
import { ChatContext } from "./context/ChatContext";
import { useRouter } from "next/navigation";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

interface Props {
  setLastMessage: any;
  inputRef: any;
  messageId?: string;
};

const MessageForm: FC<Props> = ({ }) => {
  const {data: session} = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { myUserInfo, conversationId } = useContext(ChatContext)

  const [myMessage, setMyMessage] = useState("")
  const router = useRouter()
  // send message to conversation
  const sendMessage = async (message: any) => {
    const conversationRef = doc(db, 'conversation', conversationId);
    const messagesRef = collection(conversationRef, 'messages');
    await addDoc(messagesRef, message);
    console.log("Message sent:" + message);
  }

  const onMessage = (e: any) => {
    e.preventDefault()

    if (!myMessage.trim()) return;

    const content = {
      senderUsername: 'niichan1403',
      receiverUsername: 'niichan',
      avatarUrl: session?.user?.image,
      content: myMessage,
      timestamp: serverTimestamp(),
      likes: 0
    }

    sendMessage(content)

    setTimeout(() => {
      router.refresh()
    }, 1000)

    setMyMessage("")
  }

  return (
    <div className="flex items-center mt-4">
      <Avatar imageUrl={myUserInfo.username} altText={myUserInfo.username} size={10} />
      <form onSubmit={onMessage} className="rounded-2xl py-2 px-4 ml-2 w-full bg-[#212833] caret-white" >
        <input
          type="text"
          placeholder="Say something..."
          value={myMessage}
          onChange={(e) => setMyMessage(e.target.value)}
          ref={inputRef}
          className="w-full bg-[#212833] focus:outline-none caret-white"
        />
      </form>
    </div>
  );
};

export default MessageForm;