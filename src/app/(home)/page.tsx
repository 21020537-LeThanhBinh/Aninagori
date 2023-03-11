import { UserInfo } from '@/components/nav/NavBar';
import { db } from '@/firebase/firebase-app';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { doc, getDoc } from 'firebase/firestore';
import { getServerSession } from 'next-auth';
import { PostForm, Posts } from '../../components';

async function getUserInfo(userId: string): Promise<UserInfo | undefined> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      "id": docSnap.id,
      "username": docSnap.data().username,
      "image": docSnap.data().image,
    }
  } else {
    console.log("No such document in NavBar/getUserInfo()!");
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const myUserId = (session as any)?.user?.id
  const myUserInfo = await getUserInfo(myUserId)

  if (!myUserInfo) return (
    <div>
      Loading...
    </div>
  )

  return (
    <div className='flex justify-center pt-10 bg-[#212833]'>
      <div className="flex flex-col bg-[#212833] w-2/5">
        <PostForm
          avatarUrl={myUserInfo.image} authorName={myUserInfo.username} time={''} content={''} likes={0} comments={0}
        />
        {/* @ts-expect-error Server Component */}
        <Posts />
      </div>
    </div>
  )
}