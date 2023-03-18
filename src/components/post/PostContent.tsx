import { FC } from "react";
import Avatar from "../avatar/Avatar";
import { UserInfo } from "../../global/UserInfo";
import PostOptions from "./option/PostOptions";
import { VideoComponent } from "./Video";

type PostStaticProps = {
  myUserInfo: UserInfo;
  authorName: string;
  avatarUrl: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  id: string;
};

const PostContent: FC<PostStaticProps> = ({
  myUserInfo,
  authorName,
  avatarUrl,
  timestamp,
  content,
  imageUrl,
  videoUrl,
  id
}) => {

  return (
    <div className="flex flex-col flex-1 bg-[#191c21] rounded-2xl p-4 pb-0 rounded-b-none">
      <div className="flex justify-between">
        <div className="flex items-center space-x-4 mx-2">
          <a href={"/user/" + authorName}><Avatar imageUrl={avatarUrl} altText={authorName} size={10} /></a>
          <div>
            <a href={"/user/" + authorName} className="font-bold text-[#dddede]">{authorName}</a>
            <p className="text-gray-500 text-sm">{timestamp}</p>
          </div>
        </div>
        <div className="m-2">
          <PostOptions isAdmin={myUserInfo?.is_admin || myUserInfo?.username === authorName} postId={id} />
        </div>
      </div>

      <p className="text-lg mt-4 mb-2 text-[#dddede] mx-2">{content}</p>
      <div className="mt-4 mx-2">
        {imageUrl && <img src={imageUrl} alt={""} className="rounded-2xl" />}
        {videoUrl && <VideoComponent videoUrl={videoUrl} />}
      </div>

    </div>
  );
};

export default PostContent;