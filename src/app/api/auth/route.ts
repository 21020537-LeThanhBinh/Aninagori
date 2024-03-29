import { db } from "@/firebase/firebase-admin-app"
import { FieldValue } from "firebase-admin/firestore"
import { NextResponse } from "next/server"
import qs from "qs"

const MYANIMELIST_CLIENT_ID = process.env.X_MAL_CLIENT_ID + ""
const MYANIMELIST_CLIENT_SECRET = process.env.X_MAL_CLIENT_SECRET + ""

export async function GET(request: Request, { params }: { params: any }) {
  const url = new URL(request.url)
  const origin = `${url.protocol}//${url.hostname}${url.port ? ":" + url.port : ""}`
  const REDIRECT_URI = `${origin}/api/auth`
  //first step of auth
  if (request.url === REDIRECT_URI) {
    const urlRedirect = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${MYANIMELIST_CLIENT_ID}&code_challenge=${request.headers.get(
      "codechallenge",
    )}&state=RequestID42`
    return NextResponse.json({ url: urlRedirect })
  }
  // second step of auth
  //1: get userID and codechallenge
  const str = request.headers.get("cookie")
  const obj = str?.split("; ").reduce((acc: any, curr: any) => {
    const [key, value] = curr.split("=")
    acc[key] = decodeURIComponent(value)
    return acc
  }, {})
  //2: get oauthCode
  const urlParams = new URLSearchParams(new URL(request.url).search)
  const authCode = urlParams.get("code")
  //3: get AccessToken
  const urlParamsOauth = {
    client_id: MYANIMELIST_CLIENT_ID,
    client_secret: MYANIMELIST_CLIENT_SECRET,
    code_verifier: obj.codechallenge as any,
    grant_type: "authorization_code",
    code: authCode as any,
  }
  const urlEncodedParams = qs.stringify(urlParamsOauth)
  try {
    const res = await fetch("https://myanimelist.net/v1/oauth2/token", {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlEncodedParams,
    })
    const result = await res.json()

    //4: Save Access Token and RefreshToken
    //5: Get User information and saved info to firebase
    const accessToken = result.access_token
    const url = "https://api.myanimelist.net/v2/users/@me?fields=anime_statistics"
    fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then(async (data) => {
        await db.doc(`users/${obj.userID}`).update({
          mal_connect: {
            myAnimeList_username: data.name,
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            expiresIn: result.expires_in,
            createDate: FieldValue.serverTimestamp(),
          },
        })

        return NextResponse.redirect(`${origin}`)
      })
      .catch((error) => console.error(error))
    return NextResponse.redirect(`${origin}`)
  } catch (error) {
    console.log(error)
  }
}