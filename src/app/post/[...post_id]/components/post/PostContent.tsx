import Avatar from "@/components/avatar/Avatar";
import Link from "next/link";
import { FC } from "react";
import PostOptions from "../option/PostOptionsPopup";
import { VideoComponent } from "./Video";

type PostStaticProps = {
  authorName?: string;
  avatarUrl?: string;
  timestamp?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  postId?: string;
};

const PostContent: FC<PostStaticProps> = ({
  authorName = "",
  avatarUrl = "",
  timestamp,
  content,
  imageUrl,
  videoUrl,
  postId
}) => {
  return (
    <div className="flex flex-col flex-1 bg-ani-black rounded-2xl p-4 pb-0 rounded-b-none">
      <div className="flex justify-between">
        <div className="flex items-center space-x-4 mx-2">
          <Link href={"/user/" + authorName}><Avatar imageUrl={avatarUrl} altText={authorName} size={10} /></Link>
          <div>
            <Link href={"/user/" + authorName} className="font-bold text-[#dddede]">{authorName}</Link>
            <br />
            <Link href={"/post/" + postId} className="text-gray-500 text-sm hover:underline">{timestamp}</Link>
          </div>
        </div>
        <div className="m-2">
          <PostOptions />
        </div>
      </div>

      <p className="text-lg mt-4 mb-2 text-ani-text-gray mx-2">{content}</p>
      <div className="mt-4 mx-2">
        {imageUrl && <img src={imageUrl} alt={""} className="rounded-2xl" />}
        {videoUrl && <VideoComponent videoUrl={videoUrl} />}
      </div>

    </div>
  );
};

export default PostContent;