import { db } from "@/firebase/firebase-app";
import { FriendInfo } from "@/global/FriendInfo.types";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

async function updateAvatarUrl(userId: string, avatarUrl: string) {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, { image: avatarUrl })

  const userDoc = await getDoc(userRef)
  if (userDoc.data()?.friend_list?.length) {
    const friendList = userDoc.data()?.friend_list.map((friend: FriendInfo) => friend.username)
    await updateAvatarFriendList(userDoc.data()?.username, friendList, avatarUrl)
  }
}

async function updateAvatarFriendList(myUsername: string, friendList: string[], avatarUrl: string) {
  const newInfo = {
    image: avatarUrl,
    username: myUsername,
  }

  const friendsDocsPromises = friendList.map((username: string) => {
    const docQuery = query(collection(db, "users"), where("username", "==", username))
    return getDocs(docQuery)
  })
  const friendsDocs = await Promise.all(friendsDocsPromises)

  const updatePromises = friendsDocs.map((friendDoc) => {
    if (!friendDoc.empty) {
      const docRef = friendDoc.docs[0].ref
      const oldInfo = friendDoc.docs[0].data().friend_list.find((myInfo: FriendInfo) => myInfo.username === newInfo.username)

      return Promise.all([
        updateDoc(docRef, {
          friend_list: arrayRemove(oldInfo)
        }),
        updateDoc(docRef, {
          friend_list: arrayUnion(newInfo)
        }),
      ])
    }
  })
  await Promise.all(updatePromises)
}

export { updateAvatarUrl };
