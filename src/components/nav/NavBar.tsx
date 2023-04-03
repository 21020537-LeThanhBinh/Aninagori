import { getUserInfo } from "@/global/getUserInfo";
import { BsChatDotsFill } from '@react-icons/all-files/bs/BsChatDotsFill';
import Button from "../button/Button";
import Logo from "./Logo";
import NotificationBtn from "./notification/NotificationBtn";
import ProfilePicture from "./profilePicture/ProfilePicture";
import SearchBar from "./SearchBar";

export default async function NavBar({ myUserId }: { myUserId: string | undefined }) {
  const myUserInfo = await getUserInfo(myUserId)

  return (
    <nav className="flex justify-between items-center px-8 fixed top-0 z-40 w-full h-14 header-fixed bg-ani-gray shadow-md">
      <div className="flex items-center gap-5">
        <Logo />
        <SearchBar />
      </div>
      {!myUserInfo ?
        <div>
          <Button small primary leftIcon={undefined} onClick={undefined} to={undefined} href={"/"} rightIcon={undefined}>
            Login
          </Button>
        </div>
        :
        <div className="flex items-center gap-3">
          <button title="message" className="flex item-center justify-center space-x-1 text-[#fff] bg-[#798597] hover:bg-[#94B0DD] p-3 rounded-full"><BsChatDotsFill className="w-4 h-4" /></button>
          <NotificationBtn myUserInfo={myUserInfo} />
          <ProfilePicture myUserInfo={myUserInfo} />
        </div>
      }
    </nav>
  )
}
