import { db } from "@/firebase/firebase-app";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { UserInfo } from "../../global/UserInfo.types";
import { Notification } from "../notification/Notification.types";
import { FriendInfo } from "@/global/FriendInfo.types";

// Person's info remove from Self friend list and opposite
async function unfriend(myUserInfo: UserInfo, userInfo: UserInfo) {
  const myUserRef = doc(db, 'users', myUserInfo.id);
  const userRef = doc(db, 'users', userInfo.id);

  const myFriendList: FriendInfo[] = (await getDoc(myUserRef)).data()?.friend_list;
  const userFriendList: FriendInfo[] = (await getDoc(userRef)).data()?.friend_list;

  const batch = writeBatch(db);

  batch.update(myUserRef, {
    friend_list: arrayRemove(myFriendList?.find((info) => info.username === userInfo.username))
  });
  batch.update(userRef, {
    friend_list: arrayRemove(userFriendList?.find((info) => info.username === myUserInfo.username))
  });

  await batch.commit();
}

async function notifyFriendRequestAccept(myUserInfo: UserInfo, userInfo: UserInfo) {
  const notificationsRef = doc(db, "notifications", userInfo.username);
  await updateDoc(notificationsRef, {
    recentNotifications: arrayUnion({
      title: "You and " + myUserInfo.username + " are now friends!",
      url: "/user/" + myUserInfo.username,
      sender: {
        id: myUserInfo.id,
        username: myUserInfo.username,
        image: myUserInfo.image,
      },
      type: "friend request accepted",
      timestamp: new Date(),
    })
  });
}

// Self info -> Person's friend request list
async function makeFriendRequest(myUserInfo: UserInfo, userInfo: UserInfo) {
  const notificationsRef = doc(db, "notifications", userInfo.username);
  await updateDoc(notificationsRef, {
    recentNotifications: arrayUnion({
      sender: {
        id: myUserInfo.id,
        username: myUserInfo.username,
        image: myUserInfo.image,
      },
      type: "friend request",
      timestamp: new Date(),
    }),
  });
}

// Person's info remove from Self friend request list
async function removeFriendRequest(myUserInfo: UserInfo, noti: Notification) {
  const notificationsRef = doc(db, "notifications", myUserInfo.username);
  updateDoc(notificationsRef, {
    recentNotifications: arrayRemove(noti)
  });
}

// Self info -> Person's friend list
async function addSelfToFriendList(myUserInfo: UserInfo, userInfo: UserInfo) {
  const friendUserRef = doc(db, 'users', userInfo.id);
  await updateDoc(friendUserRef, {
    friend_list: arrayUnion({
      username: myUserInfo.username,
      image: myUserInfo.image,
    })
  });
}

// Person's info -> Self friend list
async function addPersonToMyFriendList(myUserInfo: UserInfo, userInfo: UserInfo) {
  const myUserRef = doc(db, 'users', myUserInfo.id);
  await updateDoc(myUserRef, {
    friend_list: arrayUnion({
      username: userInfo.username,
      image: userInfo.image,
    })
  });
}

async function beFriends(myUserInfo: UserInfo, userInfo: UserInfo) {
  await Promise.all([
    addSelfToFriendList(myUserInfo, userInfo),
    addPersonToMyFriendList(myUserInfo, userInfo),
    notifyFriendRequestAccept(myUserInfo, userInfo),
  ])
}

export { makeFriendRequest, removeFriendRequest, beFriends, unfriend }