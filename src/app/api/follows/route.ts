import { init, fetchQuery } from "@airstack/node";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.AIRSTACK_API_KEY;
if (!apiKey) {
  throw new Error("AIRSTACK_API_KEY is not defined");
}
init(apiKey);
const isFollowingQuery = `
query isFollowing($fid: Identity!){
  Wallet(input: {identity: "fc_fid:268438"}) {
    socialFollowings(
      input: {filter: {identity: {_eq: $fid}, dappName: {_eq: farcaster}}}
    ) {
      Following {
        followingSince
      }
    }
  }
}
`;

export async function GET(req: NextRequest) {

  const ufid = req.nextUrl.searchParams.get("fid");
  // const fid = ufid === 8 ? 1 : ufid ;
  const fid = Number(ufid) === 268438 ? 553094 : ufid;
  

  if (!fid) {
    console.log("Error: userId parameter is missing");
    return NextResponse.json(
      { error: "userId parameter is required" },
      { status: 400 }
    );
  }

  try {
    const [userData] = await Promise.all([fetchQuery(isFollowingQuery, { fid: `fc_fid:${fid}` })]);

    if (userData.error) {
      console.error("Airstack API error (user data):", userData.error);
      return NextResponse.json(
        { error: userData.error.message },
        { status: 500 }
      );
    }

    // console.log(
    //   "Airstack API response (user data):",
    //   JSON.stringify(userData.data, null, 2)
    // );

    const followingData = userData.data?.Wallet?.socialFollowings?.Following;

    if (!followingData) {
      // console.log("doesnt follow you");
      return NextResponse.json({
        isFollowing: "no",
        // followingSince: null,
        message: "consider following @cashlessman.eth"
      });
    } else {
      // console.log("Follows you");
      return NextResponse.json({
        isFollowing: "yes",
        // followingSince: followingData[0]?.followingSince,
        message: ""
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
