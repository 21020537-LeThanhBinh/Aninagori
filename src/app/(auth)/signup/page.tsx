import Header from "../login/components/Header"
import Signup from "./components/Signup"

export default function SignupPage() {
  return (
    <div className={`flex justify-center h-screen w-full z-40 pt-10 bg-center bg-cover bg-[url('https://firebasestorage.googleapis.com/v0/b/aninagori-0.appspot.com/o/posts%2Fmpv_9vdIT8Z0nH.jpgc827eb64-713d-44ea-8036-b3e67f0e5d00?alt=media&token=ce4f205f-10a1-455f-b989-a33153b783fa')]`}>
      <div className="w-2/5 h-fit bg-white p-10 rounded-2xl">
        <Header
          heading="Signup to create an account"
          paragraph="Already have an account? "
          linkName="Login"
          linkUrl="/"
        />
        <Signup />
      </div>
    </div>
  )
}