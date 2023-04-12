/* eslint-disable @next/next/no-img-element */
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import classNames from "classnames/bind"
import { useCallback, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react"
import styles from "../postForm/PostForm.module.scss"

import { handleDeleteMedia, handleMediaChange, handlePaste, handleSubmitForm } from "@/app/(home)/functions/postingUtils"
import Avatar from "@/components/avatar/Avatar"
import { useRouter } from "next/navigation"
import { HomeContext } from "../../HomeContext"
import AnimeEpisodes from "./animePostComponent/AnimeEpisodes/AnimeEpisodes"
import AnimeScore from "./animePostComponent/AnimeScore/AnimeScore"
import AnimeSearch from "./animePostComponent/AnimeSearch/AnimeSearch"
import AnimeTag from "./animePostComponent/AnimeTag/AnimeTag"
import AnimeWatchStatus from "./animePostComponent/AnimeWatchStatus/AnimeWatchStatus"
import PostFormActions from "./PostFormActions"
import PostFormDetails from "./PostFormDetails"
import PostFormMediaDisplay from "./PostFormMediaDisplay"

const cx = classNames.bind(styles)

const PostFormPopUp = (props: any, ref: any) => {
  const { myUserInfo } = useContext(HomeContext)
  const { setOpen, title } = props
  const [mediaUrl, setMediaUrl] = useState<any>([])
  const [mediaType, setMediaType] = useState<string>("")
  const [showScore, setShowScore] = useState<boolean>(false)
  const [loadPosting, setLoadPosting] = useState<boolean>(false)
  const [basicPostingInfo, setBasicPostingInfo] = useState<boolean>(true)
  const [isUpdatePost, setIsUpdatePost] = useState<boolean>(true)
  const [textInput, setTextInput] = useState<string>("")

  const animeStatusRef = useRef()
  const animeSearchRef = useRef()
  const animeEpisodesRef = useRef()
  const animeTagRef = useRef()
  const animeScoreRef = useRef()
  const postAdditionalRef = useRef()
  const inputRef = useRef()

  const router = useRouter();

  const handleDeleteMediaOnce = useCallback((e: any) => { handleDeleteMedia(e, mediaUrl, setMediaUrl) }, [])
  const handleMediaChangeOnce = useCallback((e: any) => { handleMediaChange(e, mediaUrl, setMediaType, setMediaUrl) }, [])

  useEffect(() => {
    setIsUpdatePost(!(mediaUrl.length || textInput || showScore))
  }, [mediaUrl, textInput, showScore])

  useImperativeHandle(ref, () => ({
    setOpen: (open: boolean) => {
      setOpen(open);
    },
    setPostFormData: (postData: any) => {
      setTextInput(postData.content)
      if (!!postData?.post_anime_data?.tag) {
        (animeTagRef?.current as any).setAnimeTag(postData?.post_anime_data?.tag)
      }
      if (!!postData?.tag) {
        (animeTagRef?.current as any).setAnimeTag(postData?.tag)
      }
      setBasicPostingInfo(false)
      return
    }
  }))

  function clearForm() {
    (animeTagRef?.current as any).resetAnimeTag();
    (animeStatusRef?.current as any).resetAnimeStatus();
    setShowScore(false)
    setTextInput("")
    setMediaUrl([])
    setOpen(false)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoadPosting(true)

    await handleSubmitForm(
      animeStatusRef, animeSearchRef, animeEpisodesRef, animeTagRef,
      animeScoreRef, textInput, mediaUrl,
      mediaType, myUserInfo, postAdditionalRef
    )

    setLoadPosting(false)
    clearForm()
    router.refresh()
  }

  return (
    <div ref={ref} onClick={() => { !loadPosting && setOpen(false) }} className={cx("modal")}>
      <div className={cx("modal_overlay")}></div>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => !loadPosting && handleSubmit(e)}
        className="relative flex flex-col bg-[#191c21] rounded-2xl my-4 transition ease-in-out duration-200"
      >
        <FontAwesomeIcon
          onClick={() => !loadPosting && setOpen(false)}
          icon={faCircleXmark as any}
          fill="white"
          stroke="white"
          className={`${cx("close-post")} hover:cursor-pointer z-20`}
        />
        <div className="flex justify-start mt-4 px-4 mb-4 items-start">
          <Avatar imageUrl={myUserInfo.image} altText={myUserInfo.username} size={10} />
          <h4 className="text-base font-bold ml-4">{myUserInfo.username}</h4>
        </div>
        <div className={`flex flex-col px-4 max-h-[78vh] overflow-y-auto ${cx("scroll-custom")}`}>
          <div className={cx("status-wrapper")}>
            <AnimeWatchStatus ref={animeStatusRef} setShowScore={setShowScore} />
            <AnimeSearch ref={animeSearchRef} animeEpsRef={animeEpisodesRef} />
            <AnimeEpisodes ref={animeEpisodesRef} style={!showScore ? { display: "flex" } : { display: "none" }} />
            <AnimeScore ref={animeScoreRef} style={showScore ? { display: "flex" } : { display: "none" }} />
          </div>

          <input
            onChange={(e) => setTextInput(e.target.value)}
            ref={inputRef as any}
            type="text"
            onPaste={(e: any) => {
              handlePaste(e, setMediaUrl, setMediaType, mediaUrl)
            }}
            placeholder="Share your favourite Animemory now!"
            className="flex rounded-3xl mt-4 mb-5 py-3 px-4 w-full focus:outline-none bg-[#212833] caret-white"
          />
          <PostFormMediaDisplay
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            handleDeleteMedia={handleDeleteMediaOnce}
            handleMediaChange={handleMediaChange}
          />
          <AnimeTag ref={animeTagRef} />

          <div>
            <div onClick={() => { setBasicPostingInfo(!basicPostingInfo) }} className="whitespace-nowrap ml-2 my-3 text-ani-text-main cursor-pointer font-bold underline text-sm opacity-80 hover:opacity-100">
              {basicPostingInfo ? "More details..." : "Fewer details..."}
            </div>
            <div className={basicPostingInfo ? "hidden" : "flex"}>
              <PostFormDetails ref={postAdditionalRef} animeStatusRef={animeStatusRef} />
            </div>
          </div>

          <PostFormActions
            title={title}
            setBasicPostingInfo={setBasicPostingInfo}
            loadPosting={loadPosting}
            handleMediaChange={(e: any) => {
              handleMediaChange(e, mediaUrl, setMediaType, setMediaUrl)
            }}
            isUpdatePost={isUpdatePost}
          />
        </div>
      </form>
    </div>
  )
}

export default forwardRef(PostFormPopUp)
