/* eslint-disable @next/next/no-img-element */
import * as apiServices from "@/app/api/apiServices/apiServicesConfig"
import AnimeFavorite from "@/app/user/[user_name]/profileComponent/AnimeFavorite/AnimeFavorite"
import AnimeStatus from "@/app/user/[user_name]/profileComponent/AnimeStatus/AnimeStatus"
import AnimeUpdate from "@/app/user/[user_name]/profileComponent/AnimeUpdate/AnimeUpdate"
import ProfileHeader from "@/app/user/[user_name]/profileComponent/ProfileHeader/ProfileHeader"
import { db } from "@/firebase/firebase-app"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import classNames from "classnames/bind"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { getServerSession } from "next-auth/next"
import { Suspense } from "react"
import styles from "./Profile.module.scss"
import ProfilePosts from "./profileComponent/posts/PostContainer"

const cx = classNames.bind(styles)

async function Profile({ params }: { params: { user_name: string } }) {
  const session = await getServerSession(authOptions)
  let adminData = {} as any

  if (session && !!session.user) {
    const docRef = doc(db, "users", (session.user as any).id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const myAnimeList = await getDoc(doc(db, "myAnimeList", docSnap.data().username))
      const animeList = myAnimeList?.data()?.animeList
      adminData = { ...docSnap.data(), joined_date: "", id: docSnap.id, myAnimeList: animeList }
    }
  }

  // get guess information
  const usersRef = collection(db, "users")
  const usernameQuery = query(usersRef, where("username", "==", params.user_name))
  const querySnapshot = await getDocs(usernameQuery)
  if (querySnapshot.empty) return

  const guessData = { ...querySnapshot.docs[0].data(), joined_date: "", id: querySnapshot.docs[0].id } as any

  // compare between admin and guess
  const isAdmin = !querySnapshot.empty && !!session?.user && params.user_name === adminData.username
  return (
    <div className={cx("profile-wrapper")}>
      <div className={cx("profile-content")}>
        <ProfileHeader guess={guessData} admin={adminData} />
        <div className={cx("profile-body-wrapper")}>
          <div className={cx("status-section")}>
            {guessData?.mal_connect ? (
              <Suspense
                fallback={
                  <>
                    {/* @ts-expect-error Server Component */}
                    <AnimeUpdate data={[]} />
                    <AnimeStatus statusData={{}} />
                    <AnimeFavorite favorite_data={{}} />
                  </>
                }
              >
                {/* @ts-expect-error Server Component */}
                <AnimeComponent
                  access_token={guessData.mal_connect.accessToken}
                  mal_username={guessData.mal_connect.myAnimeList_username}
                />
              </Suspense>
            ) : (
              <div className={cx("mal-notfound")}>Not connected to MAL yet</div>
            )}
          </div>
          <div className={cx("post-section")}>
            <ProfilePosts myUserInfo={adminData} profileUsername={guessData.username} />
          </div>
        </div>
      </div>
    </div>
  )
}

async function AnimeComponent({ mal_username, access_token }: { mal_username: string; access_token: string }) {
  const [animeData, animeStatus, userFavorite] = await Promise.all([
    getUserAnimeUpdate(access_token, mal_username),
    getAnimeStatus(access_token),
    getAnimeFavorite(mal_username)
  ])

  return (
    <>
      {/* @ts-expect-error Server Component */}
      <AnimeUpdate data={animeData?.data} />
      <AnimeStatus statusData={animeStatus?.anime_statistics} />
      <AnimeFavorite favorite_data={userFavorite?.data.data?.favorites} />
    </>
  )
}

async function getAnimeStatus(access_token: any) {
  try {
    const url = "https://api.myanimelist.net/v2/users/@me?fields=anime_statistics"
    const animeStatus = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).then((res) => res.json())
    return animeStatus
  } catch (error) {
    console.log(error)
  }
}

async function getAnimeFavorite(mal_username: any) {
  try {
    return await apiServices.jikanRequest.get(`/users/${mal_username}/full`)
  } catch (error) {
    console.log(error)
  }
}

async function getUserAnimeUpdate(access_token: any, mal_username: any) {
  try {
    const url =
      "https://api.myanimelist.net/v2/users/@me/animelist?fields=list_status,num_episodes&limit=3&sort=list_updated_at"
    const userUpdate = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).then((res) => res.json())
    return userUpdate
  } catch (error) {
    console.log(error)
  }
}

export const fetchCache = 'force-no-store'
export default Profile

