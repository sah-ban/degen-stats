import { ImageResponse } from "next/og";
import { NextRequest} from "next/server";
import axios from "axios";


export async function GET(req: NextRequest) {


  const fid = req.nextUrl.searchParams.get("fid");
  const tsParam = req.nextUrl.searchParams.get("ts");
  let formattedDate: string = "";
  const appUrl = process.env.NEXT_PUBLIC_URL;

  if (tsParam !== null) {
    const ts = Number(tsParam); // Convert the string to a number
    if (!isNaN(ts)) {
      const date = new Date(ts); // Create the Date object
      formattedDate = date.toLocaleDateString('en-GB').replace(/\//g, '-');
    } else {
      console.error("Invalid timestamp provided.");
    }
  } else {
    console.error("Timestamp parameter 'ts' is missing.");
  }
  

  interface AllowanceData {
    snapshot_day: string;
    fid: string;
    user_rank: string;
    tip_allowance: string;
    remaining_tip_allowance: string;
  }

  interface DegenStats {
    allowancesData: AllowanceData[];
    points: string;
    pointsRank: string;
  }

  let data: AllowanceData | null = null;
  let points: string | null = null;
  let pointsRank: string | null = null;
  let pfpUrl: string = "";
  let username: string = "";
  let display_name: string = "";


  if (fid) {
    try {
      const fidResponse = await fetch(`${appUrl}/api/degen?fid=${fid}`);
      if (!fidResponse.ok) {
        throw new Error(`Fid HTTP error! Status: ${fidResponse.status}`);
      }
      const responseData: DegenStats = await fidResponse.json();

      // Assign data and points-related values
      if (responseData.allowancesData?.length > 0) {
        data = responseData.allowancesData[0];
      }
      points = responseData.points;
      pointsRank = responseData.pointsRank;
    } catch (err) {
      console.error("Error fetching Degen Stats:", err);
    }
  }
  if (fid) {
    console.log(`Fetching data from API for fid: ${fid}`);
    const apiUrl = `https://api.warpcast.com/v2/user?fid=${fid}`;
    const response = await axios.get(apiUrl);

    pfpUrl = response.data?.result?.user?.pfp?.url; // Assign value to pfpUrl
    username = response.data?.result?.user?.username; // Assign value to username
    display_name = response.data?.result?.user?.displayName; // Assign value to display_name
  }
  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full bg-[#1e293b] text-[#FFDEAD]">
        <div tw="flex items-center justify-center text-white mt-10">
          <img
            src={pfpUrl}
            alt="Profile"
            tw="w-15 h-15 rounded-lg mr-4"
          />
          <div tw="flex flex-col">
            <span tw="flex text-2xl">{display_name}</span>
            <span tw="flex text-1xl">@{username}</span>
          </div>
        </div>
        <div tw="flex text-2xl justify-center text-[#38BDf8] mt-2">
        {formattedDate}
        </div>


        <div tw="flex flex-row items-center justify-between text-[#885aee] mt-2 mx-12">
          <div tw="flex text-2xl">Allowance Rank: {data?.user_rank ?? "N/A"}</div>
          <div tw="flex text-2xl">Points Rank: {pointsRank ?? "N/A"}</div>
        </div>
        <div tw="flex flex-col px-10 w-full mx-1 text-[#86e635] mt-2">
          <div tw="flex flex-row justify-between">
            <span tw="text-3xl">Allowance:</span>
            <span tw="text-3xl">{data?.tip_allowance ?? "N/A"}</span>
          </div>
          <div tw="flex flex-row justify-between">
            <span tw="text-3xl">Remaining:</span>
            <div tw="flex">
              <span tw="text-3xl">{data?.remaining_tip_allowance ?? "N/A"}</span>
                {data?.tip_allowance &&
                               <span tw="text-3xl ml-3">

                 ({(
                      (Number(data?.remaining_tip_allowance) /
                        Number(data?.tip_allowance)) *
                      100
                    ).toFixed(1) ?? "N/A"}%)
              </span>}
            </div>
          </div>
          <div tw="flex flex-row justify-between">
            <span tw="text-3xl">Points:</span>
            <span tw="text-3xl">{points ?? "N/A"}</span>
          </div>
        </div>
        <div tw="flex flex-col items-center">

        </div>
        <div tw="flex bg-[#FFFACD] mt-8 text-black w-full justify-end px-4">
          <div tw="text-1xl">Frame by @cashlessman.eth</div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 400,
    }
  );

}
