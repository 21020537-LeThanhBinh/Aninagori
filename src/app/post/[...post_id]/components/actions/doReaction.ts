import { shortenString } from '@/components/utils/formatData';
import { db } from '@/firebase/firebase-app';
import { CommentInfo } from '@/global/Post.types';
import { ReactionInfo } from '@/global/Post.types';
import { UserInfo } from '@/global/UserInfo.types';
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp, getDoc } from 'firebase/firestore';

async function updateAnimePreference(myUserInfo: UserInfo, animeID: number | undefined, hasReaction: boolean) {
  if (!animeID || !myUserInfo.id) return;

  const docRef = doc(db, 'postPreferences', myUserInfo.username);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;

  const thisAnimePreference = docSnap.data().animeList?.find((anime: any) => anime.id == animeID);
  const thisAnimePotential = thisAnimePreference ? thisAnimePreference.potential : 10;

  if (thisAnimePreference) {
    await updateDoc(docRef, {
      animeList: arrayRemove({
        id: animeID,
        potential: thisAnimePotential
      })
    });
  }

  if (hasReaction) {
    await updateDoc(docRef, {
      animeList: arrayUnion({
        id: animeID,
        potential: Math.min(thisAnimePotential + 2, 20)
      })
    });
  } else {
    await updateDoc(docRef, {
      animeList: arrayUnion({
        id: animeID,
        potential: Math.max(thisAnimePotential - 1, 1)
      })
    });
  }
}

async function sentReactionOnPost(myUserInfo: UserInfo, myReaction: ReactionInfo, reactionToggle: boolean, authorName: string, content: string, postId: string, reactions2: ReactionInfo[], commentId?: string) {
  const docRef = commentId ?
    doc(db, 'posts', postId, 'comments', commentId) :
    doc(db, 'posts', postId)

  if (!reactionToggle) {
    await updateDoc(docRef, {
      reactions: arrayUnion(myReaction)
    });
    if (myUserInfo.username != authorName)
      notifyReaction(myUserInfo, authorName, content, postId, commentId)
  } else {
    const currentReaction = reactions2.find((e) => e.username === myUserInfo.username) as ReactionInfo

    if (currentReaction?.type === myReaction.type) {
      await updateDoc(docRef, {
        reactions: arrayRemove(myReaction)
      });
    }
    else {
      await updateDoc(docRef, {
        reactions: arrayRemove(currentReaction)
      });
      await updateDoc(docRef, {
        reactions: arrayUnion(myReaction)
      });
    }
  }
}

async function sentReaction(myUserInfo: UserInfo, myReaction: ReactionInfo, reactionToggle: boolean, authorName: string, content: string, postId: string, commentId?: string) {
  const docRef = commentId ?
    doc(db, 'posts', postId, 'comments', commentId) :
    doc(db, 'posts', postId)

  if (!reactionToggle) {
    await updateDoc(docRef, {
      reactions: arrayUnion(myReaction)
    });
    if (myUserInfo.username != authorName)
      notifyReaction(myUserInfo, authorName, content, postId, commentId)
  } else {
    await updateDoc(docRef, {
      reactions: arrayRemove(myReaction)
    });
  }
}

async function sentReactionReply(myUserInfo: UserInfo, replyReactions: Object[], reactionToggle: boolean, reply: CommentInfo, postId: string) {
  let oldReply = {
    avatarUrl: reply.avatarUrl,
    content: reply.content,
    timestamp: new Timestamp(reply.realTimestamp!.seconds, reply.realTimestamp!.nanoseconds),
    username: reply.username,
  } as any

  if (reply.reactions)
    oldReply = { ...oldReply, reactions: reply.reactions }

  const docRef = doc(db, 'posts', postId, 'comments', reply.parentId!)

  if (!reactionToggle) {
    updateDoc(docRef, {
      replies: arrayRemove(oldReply)
    });
    updateDoc(docRef, {
      replies: arrayUnion({ ...oldReply, reactions: replyReactions })
    });
    if (myUserInfo.username != reply.username)
      notifyReaction(myUserInfo, reply.username, reply.content, postId, reply.parentId)
  } else {
    updateDoc(docRef, {
      replies: arrayRemove(oldReply)
    });
    updateDoc(docRef, {
      replies: arrayUnion({ ...oldReply, reactions: replyReactions })
    });
  }
}

async function notifyReaction(myUserInfo: UserInfo, rcvUsername: string, content: string, postId: string, commentId?: string) {
  let title = ""
  if (!!commentId) {
    title = myUserInfo.username + ' reacted to your comment' + ((content.length) ? `: "${shortenString(content, 24)}"` : `.`)
  } else {
    title = myUserInfo.username + ' reacted to your post' + ((content.length) ? `: "${shortenString(content, 24)}"` : `.`)
  }

  const notificationsRef = doc(db, 'notifications', rcvUsername);
  await updateDoc(notificationsRef, {
    recentNotifications: arrayUnion({
      title: title,
      url: '/post/' + postId + (commentId ? '/comment/' + commentId : ''),
      sender: {
        username: myUserInfo.username,
        image: myUserInfo.image,
      },
      type: 'reaction',
      timestamp: new Date(),
    })
  });
}

export { sentReaction, sentReactionOnPost, sentReactionReply, updateAnimePreference }