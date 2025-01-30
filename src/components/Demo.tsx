"use client";

import { useEffect, useCallback, useState } from "react";
// import sdk, {
//   FrameNotificationDetails,
//   type FrameContext,
// } from "@farcaster/frame-sdk";
import sdk, {
  AddFrame,
FrameNotificationDetails,
// SignIn as SignInCore,
type Context,
} from "@farcaster/frame-sdk";

// import { Button } from "~/components/ui/Button";
import Link from 'next/link';
import Image from 'next/image';

export default function Demo(
  { title }: { title?: string } = { title: "demo title" }

) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [addFrameResult, setAddFrameResult] = useState("");
  const [activeDiv, setActiveDiv] = useState<'Home' | 'AllowanceTable' | 'TipsTable' | 'Leaderboard'>('Home'); // Explicitly typed

  // const [addFrameResult, setAddFrameResult] = useState("");
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);
  // const [sendNotificationResult, setSendNotificationResult] = useState("");
  // const [setSendNotificationResult] = useState("");
  const [clicked, setClicked] = useState(false);


  useEffect(() => {
    setNotificationDetails(context?.client.notificationDetails ?? null);
  }, [context]);


  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready({});
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }
      
      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);
////////////////////////////////
  // const sendNotification = useCallback(async () => {
  //   setSendNotificationResult("");
  //   if (!notificationDetails || !context) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/send-notification", {
  //       method: "POST",
  //       mode: "same-origin",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         fid: context.user.fid,
  //         notificationDetails,
  //       }),
  //     });

  //     if (response.status === 200) {
  //       setSendNotificationResult("Success");
  //       return;
  //     } else if (response.status === 429) {
  //       setSendNotificationResult("Rate limited");
  //       return;
  //     }

  //     const data = await response.text();
  //     setSendNotificationResult(`Error: ${data}`);
  //   } catch (error) {
  //     setSendNotificationResult(`Error: ${error}`);
  //   }
  // }, [context, notificationDetails]);
  ////////////////////////////////////////////////////////////////

interface allowancesData {
  snapshot_day: string;
  user_rank: string;
  tip_allowance: string;
  remaining_tip_allowance: string;
}
interface leader {
  leaderboard_rank: string;
  fid: string;
  wallet_address: string;
  points: string;
  display_name: string;
  avatar_url: string;
  fname: string;
}

interface AllowanceResponse {
  data: allowancesData[];
}
interface TipsData {
  snapshot_day: string;
  cast_hash: string;
  recipient_fid: string;
  tip_status: string;
  tip_amount: string;
}

interface PointsResponse {
  points: string;
  pointsRank: string;
}
interface TipsResponse {
tipsData: TipsData[]
}
interface RainResponse {
  rainPoints: string
  }
  interface LeaderboardResponse {
    leaderData: leader[];
  }
interface FollowResponse {
  followBack: string;
  }
const [allowanceData, setAllowanceData] = useState<AllowanceResponse | null>(null);

const fetchAllowance = useCallback(async (fid: string) => {
  try {
    const allowanceResponse = await fetch(`/api/allowance?fid=${fid}`);
    if (!allowanceResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${allowanceResponse.status}`);
    }

    const allowanceResponseData = await allowanceResponse.json();
    if (
      allowanceResponseData &&
      Array.isArray(allowanceResponseData.allowancesData)
    ) {
      setAllowanceData({
        data: allowanceResponseData.allowancesData,
      });

    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching data from Allowance", err);
  }
}, []);


  const [pointsData, setPointsData] = useState<PointsResponse | null>(null);

  const fetchPoints = useCallback(async (fid: string) => {
    try {
      const pointsResponse = await fetch(`/api/points?fid=${fid}`);
      if (!pointsResponse.ok) {
        throw new Error(`Fid HTTP error! Status: ${pointsResponse.status}`);
      }
      const pointsResponseData = await pointsResponse.json();

      if (
        pointsResponseData &&
        typeof pointsResponseData.points === "string" &&
        typeof pointsResponseData.pointsRank === "string"
      ) {
        setPointsData({
          points: pointsResponseData.points,
          pointsRank: pointsResponseData.pointsRank,
        });
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      console.error("Error fetching points data", err);
    }

}, []);

const [tipsData, setTipsData] = useState<TipsResponse | null>(null);

const fetchTips = useCallback(async (fid: string) => {
  try {
    const tipsResponse = await fetch(`/api/tips?fid=${fid}`);
    if (!tipsResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${tipsResponse.status}`);
    }
    const tipsResponseData = await tipsResponse.json();

    if (
      tipsResponseData &&
      Array.isArray(tipsResponseData.tipsArray)
    ) {
      setTipsData({
        tipsData: tipsResponseData.tipsArray
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching tips data", err);
  }

}, []);
const [rainData, setRainData] = useState<RainResponse | null>(null);

const fetchRain = useCallback(async (fid: string) => {
  try {
    const rainResponse = await fetch(`/api/raindrop?fid=${fid}`);
    if (!rainResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${rainResponse.status}`);
    }
    const rainResponseData = await rainResponse.json();

    if (
      rainResponseData &&
      typeof rainResponseData.rainPoints === "string"    ) {
      setRainData({
        rainPoints: rainResponseData.rainPoints,
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching rain data", err);
  }

}, []);

const [leaderboardData, setleaderboardData] = useState<LeaderboardResponse | null>(null);

const fetchLeaderboard = useCallback(async () => {
  try {
    const leaderBoardResponse = await fetch(`/api/leaderboard`);
    if (!leaderBoardResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${leaderBoardResponse.status}`);
    }

    const leaderResponseData = await leaderBoardResponse.json();
    if (
      leaderResponseData &&
      Array.isArray(leaderResponseData.leaderboardData)
    ) {
      setleaderboardData({
        leaderData: leaderResponseData.leaderboardData,
        
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching leaderboard", err);
  }
}, []);

const dc = useCallback((fid: string, username: string) => {
  try {
     fetch(`/api/dc?fid=${fid}&username=${username}`);

  } catch (err) {
    console.error("Error sendinding DC from warpcast", err);
  }
}, []);
const [followData, setFollowData] = useState<FollowResponse | null>(null);

const followBack = useCallback(async (fid: string) => {
  try {
    const followResponse = await fetch(`/api/follows?fid=${fid}`);
    if (!followResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${followResponse.status}`);
    }
    const followResponseData = await followResponse.json();

    if (
      followResponseData
        ) {
        setFollowData({
        followBack: followResponseData.isFollowing,
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching followBack data", err);
  }

}, []);

const headers: { Home: string; AllowanceTable: string; TipsTable: string; Leaderboard: string } = {
  Home: "$DEGEN Stats",
  AllowanceTable: "Allowance Tracker",
  TipsTable: "Tips Tracker",
  Leaderboard: "Leaderboard",
};

useEffect(() => {
  if (context?.user.fid) {
    followBack(String(context.user.fid));
    fetchAllowance(String(context.user.fid));
    fetchPoints(String(context.user.fid));
    fetchTips(String(context.user.fid));
    fetchRain(String(context.user.fid));
    fetchLeaderboard();
  }
}, [context?.user.fid]);
////////////////////////////////////////////////////////////////////////////////////////////////
// useEffect(() => {
//   if (context?.user.fid && followData && followData?.followBack === "yes") {
//     fetchAllowance(String(context.user.fid));
//     fetchPoints(String(context.user.fid));
//     fetchTips(String(context.user.fid));
//     fetchRain(String(context.user.fid));
//     fetchLeaderboard();
//     // dc(String(context.user.fid),String(context.user.username)); 
//   }
// }, [followData]);
useEffect(() => {
  if (followData && followData?.followBack === "no") {
    sdk.actions.viewProfile({ fid: 268438 })
    dc(String(context?.user.fid),String(context?.user.username)); 

  }
}, [followData]);

const handleClick = () => {
  addFrame(); // Call the existing addFrame function
  setClicked(true); // Update text to "Added"
};
const date = new Date(); // Create the Date object
const formattedDate = date.toLocaleDateString('en-GB').replace(/\//g, '-');

const formattedTime = date.toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false, // Use 24-hour format
}); 
const formatSnapshotDay = (dateString: string) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}-${month}`;
};

const shareTextData = encodeURIComponent(
  `My $DEGEN stats \n \nV2 frame by @cashlessman.eth`
);
const shareText = encodeURIComponent(
  `$DEGEN stats \n \nV2 frame by @cashlessman.eth`
);

const tiped =  encodeURIComponent(
``
);
const fid= context?.user.fid;

const shareUrlData = `https://warpcast.com/~/compose?text=${shareTextData}&embeds[]=https://degen-v2.vercel.app?fid=${fid}&${Date.now()}`;
const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://degen-v2.vercel.app`;
const sendDC = `https://warpcast.com/~/inbox/create/268438?text=Hey! I'm unable to access the frame, can you please check.`;

const tipUrl = `https://warpcast.com/~/compose?text=${tiped}&parentCastHash=0xefeba64cabdcfbc619b7d6003f993f460e3a6cef`;
  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!context?.user.fid)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="flex flex-col items-center justify-center text-white text-2xl p-4">
        <p className="flex items-center justify-center text-center">
          you need to access this frame from inside a farcaster client
        </p>
        <p className="flex items-center justify-center text-center">
          (click on the logo to open in Warpcast)
        </p>
    
        <div className="flex items-center justify-center p-2 bg-white rounded-lg mt-4">
          <Link href="https://warpcast.com/cashlessman.eth/0xefeba64c" className="shadow-lg shadow-white">
            <Image
              src="https://warpcast.com/og-logo.png"
              alt="warpcast logo"
              width={100}
              height={100}
            />
          </Link>
        </div>
      </div>
    </div>
    
    );

if (followData && followData?.followBack === "no")
 return (
      <IsFollowing/>
      );

  return (
<div className="w-auto bg-slate-900 text-white h-screen">
{pointsData?.pointsRank && rainData?.rainPoints ? (
      <div>
      <Mobile/>
      </div>
    ) : (
      <Loading/>
    )}

</div>

  );
  function Mobile( ) {
    return (

      <div className="w-auto bg-slate-900 flex flex-col min-h-screen text-black">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-4 hidden">{title}</h1>

      <header className="bg-slate-800 text-white py-3">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-2xl font-bold text-sky-400">{headers[activeDiv]}</h1>
    </div>
  </header>

      {/* Body */}
      <main className="flex-grow overflow-auto">
        {activeDiv === 'Home' && (
          <Home/>
        )}
        {activeDiv === 'AllowanceTable' && (
          <AllowanceTable/>
        )}
        {activeDiv === 'TipsTable' && (
          <TipsTable/>
        )}
        {activeDiv === 'Leaderboard' && (
          <Leaderboard/>        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white p-4 font-bold">
        <div className="flex justify-around">
          <button
            className={`p-2 ${
              activeDiv === 'Home' ? 'bg-[#8E51FF]' : 'bg-gray-600'
            } rounded`}
            onClick={() => setActiveDiv('Home')}
          >
            Stats
          </button>
          <button
            className={`p-2 ${
              activeDiv === 'AllowanceTable' ? 'bg-[#8B5CF6]' : 'bg-gray-600'
            } rounded`}
            onClick={() => setActiveDiv('AllowanceTable')}
          >
            Allowance
          </button>
          <button
            className={`p-2 ${
              activeDiv === 'TipsTable' ? 'bg-[#8B5CF6]' : 'bg-gray-600'
            } rounded`}
            onClick={() => setActiveDiv('TipsTable')}
          >
            Tips
          </button>
          <button
            className={`p-2 ${
              activeDiv === 'Leaderboard' ? 'bg-[#8B5CF6]' : 'bg-gray-600'
            } rounded`}
            onClick={() => setActiveDiv('Leaderboard')}
          >
            Leaderboard
          </button>
        </div>
      </footer>
    </div>
    
    );
  }
  function Loading( ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="flex items-center justify-center">          <img
            src="https://media.decentralized-content.com/-/rs:fit:800:800/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFma3JlaWFtamxhZnB2ZXE3NjVuaGF1YWRkb2QzbHVmY2piYjVveTY1ZzVsdGI3aWwyN2hxeGd0bzQ"
            alt="Degen Logo"
            className="w-12 h-12 rounded-lg"
          /></div>
        <p className="mt-4 text-gray-100 text-lg font-semibold">Loading, please wait...</p>
      </div>
    </div>
    
    );
  }
  function Home( ) {
    return (
<div className="w-auto bg-slate-900 text-white mt-3 mx-2 flex flex-col justify-between h-[calc(100vh-140px)]">
  <Stats />
  <div className="flex items-center justify-center">          <img
            src="https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/dda7b6c0-d6c1-4ad4-e0b5-61495dbe6a00/original"
            alt="Degen Logo"
            className="w-20 aspect-square rounded-lg"
          /></div>
  <Details />
</div>

    );
  }

  function Details () {
    return(
      <div className="flex flex-col">
         <div
  // className="bg-[#8B5CF6] p-3 mt-2 mx-2 justify-self-center flex-1 text-center cursor-pointer"
  className={`bg-[#8B5CF6] p-3 mt-2 justify-self-center flex-1 text-center cursor-pointer ${context?.client.added ? "hidden" : ""}`}
  onClick={handleClick}
  >
{clicked ? "Frame Added" : "Add Frame"}</div>
  <div className="text-base/6 font-semibold">

    <div className="flex flex-row justify-self-center w-full">

 <div
  className="bg-[#8B5CF6] p-3 mt-2 justify-self-center flex-1 text-center cursor-pointer"
  onClick={() => sdk.actions.openUrl(shareUrlData)}
>
  Share
  <span className="block text-sm">(with data)</span>
</div>

<div
  className="bg-[#8B5CF6] p-3 mt-2 ml-2 justify-self-center flex-1 text-center cursor-pointer"
  onClick={() => sdk.actions.openUrl(shareUrl)}
>
  Share
  <span className="block text-sm">(without data)</span>
</div>
      {Array.isArray(allowanceData?.data) && allowanceData?.data.length > 0 && (
        <div
  className="bg-[#8B5CF6] p-3 mt-2 ml-2 justify-self-center flex-1 text-center cursor-pointer flex items-center justify-center"
  onClick={() => sdk.actions.openUrl(tipUrl)}
>
  Tip
</div>

      )}
      
    </div>
  </div>
  <div>
    {/* Placeholder for future functionality */}
    <div className="mt-2 mb-4 text-sm hidden">
      Client fid {context?.client.clientFid},
      {context?.client.added ? " frame added to client," : " frame not added to client,"}
      {notificationDetails ? " notifications enabled" : " notifications disabled"}
    </div>

    <div className="mt-0">
      <div className="mb-2 text-sm hidden">
        Add frame result: {addFrameResult}
      </div>
    </div>

    {/* <div className="mb-2 text-sm">
      Send notification result: {sendNotificationResult}
    </div>
    <div className="mb-4">
      <Button onClick={sendNotification} disabled={!notificationDetails}>
        Send notification
      </Button>
    </div> */}
    <div className="flex flex-row justify-self-center w-full mb-3">

      <div
      className="bg-[#8B5CF6] p-3 text-center mt-2 text-base/6 font-semibold flex-1 cursor-pointer"
      onClick={()=>sdk.actions.openUrl("https://warpcast.com/cashlessman.eth")}
      >
        @cashlessman.eth
      </div>
    <div
      className="bg-[#8B5CF6] p-3 text-center mt-2 ml-2 text-base/6 font-semibold flex-1 cursor-pointer"
      onClick={()=> sdk.actions.close()}
    >
      Close Frame
    </div>
    </div>
  </div>
  </div>
    )}
  function Stats( ) {
    return (
      <div className="flex flex-col w-full bg-[#1e293b] text-white border-2 border-lime-400 text-xl">
      <div className="flex items-center justify-center text-white mt-3">
        <img
          src={context?.user.pfpUrl}
          alt="Profile"
          className="w-14 aspect-square rounded-lg mr-4"
        />
        <div className="flex flex-col">
          <span className="flex">{context?.user.displayName ?? "Anonymous"}</span>
          <span className="flex text-gray-400">@{context?.user.username ?? "unknown"}</span>
        </div>
      </div>
      <div className="flex justify-center text-[#38BDf8] mt-1">{formattedTime}&nbsp; &nbsp;{formattedDate}</div>
      <div className="flex flex-row items-center justify-between text-[#885aee] mt-1 px-3">
        <div className="flex text-lg">Allowance Rank: {allowanceData?.data[0]?.user_rank ?? "N/A"}</div>
        <div className="flex text-lg">Points Rank: {pointsData?.pointsRank ?? "N/A"}</div>

   
        </div>
        <div className="flex flex-col w-full text-[#86e635] mt-2">

        <div className="flex flex-row justify-between px-12">
          <span>Allowance:</span>
          <span>{allowanceData?.data[0]?.tip_allowance ?? "N/A"}</span>
        </div>

        <div className="flex flex-row justify-between px-12">
<span>Remaining:</span>
<div className="flex">
  <span>{allowanceData?.data[0]?.remaining_tip_allowance ?? "N/A"} </span>
  {Array.isArray(allowanceData?.data) && allowanceData?.data.length > 0 &&
                               <span className="ml-1">

({((Number(allowanceData?.data[0]?.remaining_tip_allowance) / Number(allowanceData?.data[0]?.tip_allowance)) * 100).toFixed(1) ?? "N/A"}%)
              </span>}


</div>
</div>
        <div className="flex flex-row justify-between px-12">
          <span >Points:</span>
          <span >{pointsData?.points ?? "0"}</span>

        </div>
        <div className="flex flex-row justify-between px-12 mb-3">
          <span >Raindrops:</span>
          <span >{rainData?.rainPoints ?? "0"}</span>

        </div>
        </div>
    </div>
    );
  }

  function AllowanceTable( ) {
    return (
      <div className="bg-[#1E293B] h-[calc(100vh-140px)] overflow-auto mx-3">
        {/* <header className="bg-slate-800 text-white py-4">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-2xl font-bold text-sky-400 sticky top-0 z-10">Allowance Tracker</h1>
    </div>
  </header> */}

        <table className="table-auto w-auto bg-slate-700 text-lime-400 text-center">
          <thead className="sticky top-0 bg-slate-700">
            <tr className="text-white text-violet-400 border-b border-lime-400">
              <th className="px-4 py-2 min-w-[80px]">Date</th>
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Allowance</th>
              <th className="px-4 py-2">Unused Allowance</th>
            </tr>
          </thead>
          {Array.isArray(allowanceData?.data) && allowanceData?.data.length > 0 ? (
            <tbody>
              {Array.isArray(allowanceData?.data) &&
                allowanceData?.data.length > 1 &&
                allowanceData.data.slice(0, -6).map((item, index) => (
                  <tr key={index} className="odd:bg-slate-700 even:bg-slate-600">
                    <td className="px-4 py-2">
                      {formatSnapshotDay(item?.snapshot_day ?? "N/A")}
                    </td>
                    <td className="px-4 py-2">{item?.user_rank ?? "N/A"}</td>
                    <td className="px-4 py-2">{item?.tip_allowance ?? "N/A"}</td>
                    <td className="px-4 py-2">{item?.remaining_tip_allowance ?? "N/A"}</td>
                  </tr>
                ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td className="px-4 py-4" colSpan={4}>Stake Atleast 10,000 $DEGEN to get Allowance</td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    );
  }

  function TipsTable( ) {
    return (
      <div className="bg-[#1E293B] h-[calc(100vh-140px)] overflow-auto mx-3">
  {/* <h1 className="text-2xl font-bold text-sky-400 text-center p-2 pt-0">
    Tips Tracker
  </h1> */}

  <table className="table-auto w-auto bg-slate-700 text-lime-400 text-center">
    <thead className="sticky top-0 bg-slate-700">
      <tr className="text-white text-violet-400 border-b border-lime-400">
        <th className="py-2  min-w-[80px]">Date</th>
        <th className="py-2">Receiver FID</th>
        <th className="py-2">Tip Amount</th>
        <th className="py-2">Tip Status</th>
        <th className="py-2">View cast</th>

      </tr>
    </thead>
    {Array.isArray(tipsData?.tipsData) && tipsData?.tipsData.length > 0 ? (
 <tbody>
 {Array.isArray(tipsData?.tipsData) &&
tipsData.tipsData.slice(0, -5).map((item, index) => (
<tr
key={index} className="odd:bg-slate-700 even:bg-slate-600">
   
       <td className="px-4 py-2">
       {formatSnapshotDay(item?.snapshot_day ?? "N/A")}
       </td>
       <td className="px-4 py-2 cursor-pointer" onClick={()=>sdk.actions.viewProfile({ fid: Number(item?.recipient_fid) })}>{item?.recipient_fid ?? "N/A"}</td>
       <td className="px-4 py-2">{item?.tip_amount ?? "N/A"}</td>
       <td className="px-4 py-2">{item?.tip_status ?? "N/A"}</td>
       <td className="px-4 py-2 text-3xl cursor-pointer" onClick={()=>sdk.actions.openUrl(`https://warpcast.com/~/conversations/${(item?.cast_hash).replace(/\\/, '0')}`)}>&#x2197;</td>
     </tr>
   ))}
</tbody>
    ) : (
      <tbody>
<tr>
<td className="px-4 py-4" colSpan={5}>No Tips Given</td>
      </tr>
      </tbody>

    )}
  </table>
</div>  

    );
  }
  function Leaderboard( ) {
    return (
      <div className="bg-[#1E293B] h-[calc(100vh-140px)] overflow-auto mx-3">
  {/* <h1 className="text-2xl font-bold text-sky-400 text-center p-2 pt-0">
    Leaderboard
  </h1> */}

  <table className="table-auto w-auto bg-slate-700 text-lime-400 text-center">
    <thead className="sticky top-0 bg-slate-700">
      <tr className="text-white text-violet-400 lime-400">
        <th className="px-4 py-2">Rank</th>
        <th className="px-4 py-2">User</th>
        <th className="px-4 py-2">Points</th>


      </tr>
    </thead>
 <tbody>
 <tr className="border-2 border-lime-400">
    <td className="px-4 py-2">
  {pointsData?.pointsRank ?? "N/A"}    </td>
       <td className="px-4 py-2">
  <div className="flex items-center" onClick={()=>sdk.actions.viewProfile({ fid: Number(context?.user.fid) })}>
    <img
      src={context?.user.pfpUrl}
      alt="Profile"
      className="w-10 h-10 rounded-lg mr-4"
    />
     @{context?.user.username ?? "N/A"}
  </div>
</td>


       <td className="px-4 py-2">{pointsData?.points ?? "N/A"}</td>
  </tr>
 {Array.isArray(leaderboardData?.leaderData) &&
leaderboardData.leaderData.map((item, index) => (
<tr
key={index}
//  className="odd:bg-slate-700 even:bg-slate-600">
     className={`odd:bg-slate-700 even:bg-slate-600 ${
      context?.user.fid?.toString() === item?.fid
      ? "border-2 border-lime-400" : ""
  }`}>
       <td className="px-4 py-2">
       {item?.leaderboard_rank }
       </td>
       <td className="px-4 py-2">
  <div className="flex items-center" onClick={()=>sdk.actions.viewProfile({ fid: Number(item?.fid) })}>
    <img
      src={item?.avatar_url}
      alt="Profile"
      className="w-10 h-10 rounded-lg mr-4"
    />
    @{item?.fname ?? "N/A"}
  </div>
</td>


       <td className="px-4 py-2">{item?.points ?? "N/A"}</td>
     </tr>
   ))}
</tbody>
  </table>
</div>  

    );
  }
function IsFollowing( ) {
    return (
<div className="w-auto bg-slate-900 flex flex-col h-screen">
<header className="bg-slate-800 py-3">
    <div className="container px-4 text-center">
      <h1 className="text-2xl font-bold text-sky-400">{headers[activeDiv]}</h1>
    </div>
  </header>
  <div className="text-center px-10 py-5 mt-14 font-bold text-lime-400 text-2xl h-[calc(100vh-140px)]">
  Follow cashlessman.eth to access this Frame
  <div
      className="bg-[#8B5CF6] p-3 text-center mt-7 text-base/6 font-semibold cursor-pointer text-white"
      onClick={()=>sdk.actions.viewProfile({ fid: 268438 })}
      >
        Follow
      </div>
      <div
      className="text-center mt-7 text-sm font-semibold text-white"
      >If you were already following cashlessman.eth (not just now) and still can&apos;t access this frame, please send a DC.
      </div>
      <div
      className="bg-[#8B5CF6] p-3 text-center mt-2 text-base/6 font-semibold cursor-pointer text-white"
      onClick={() => sdk.actions.openUrl(sendDC)}      >
        Send DC
      </div>
  </div>

</div>


    );
  }
}
