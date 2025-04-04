"use client";

import { useEffect, useCallback, useState, useRef } from "react";
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
import axios from "axios";
import { encodeFunctionData } from 'viem';
import { abi } from '../contracts/abi';
import { claimAbi } from '../contracts/claimAbi';
import {
  useAccount,
  useSendTransaction,
  useConnect,
  useWaitForTransactionReceipt,

} from "wagmi";
import { config } from "~/components/providers/WagmiProvider";
// import { BaseError, UserRejectedRequestError } from "viem";
// import { truncateAddress } from "~/lib/truncateAddress";
import { Menu, User, Settings, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Demo(
  { title }: { title?: string } = { title: "demo title" }

) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [addFrameResult, setAddFrameResult] = useState("");
  const [activeDiv, setActiveDiv] = useState<'Home' | 'AllowanceTable' | 'TipsTable' | 'Leaderboard'>('Home'); // Explicitly typed
  const [activeBoard, setActiveBoard] = useState<'RainBoard' | 'PointsBoard' | 'AllowanceBoard'>('RainBoard'); // Explicitly typed
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
const [shared, setShared]= useState(false)  


  // const [addFrameResult, setAddFrameResult] = useState("");
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);
  // const [sendNotificationResult, setSendNotificationResult] = useState("");
  // const [setSendNotificationResult] = useState("");
  const [clicked, setClicked] = useState(false);
  const { connect } = useConnect();


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
  const [refid, setRefid ] = useState(undefined);

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          // ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          // : "Added, got no notification details"
          ? `Frame Added`
          : "Frame Added"
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

  const {
    sendTransaction,
    // error: sendTxError,
    // isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

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
// interface FollowResponse {
//   followBack: string;
//   }
  interface rainboardResponse {
    rainLeaderData: rainleader[];
  }
  interface rainleader {
    fid: string;
    points: string;
    display_name: string;
    avatar_url: string;
    fname: string;
    rank:number;
  }
  interface allowanceboardResponse {
    allowLeaderData: allowanceleader[];
  }
  interface allowanceleader {
    fid: string;
    tip_allowance: string;
    remaining_tip_allowance: string;
    user_rank:string;
  }
  interface PriceResponse {
    price: number;
    t24: number;
    t1: number;
  }
  interface ProfileResponse {
    pfpUrl: string;
    username: string;
    display_name: string;
    fids: string;
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

// const dc = useCallback((fid: string, username: string) => {
//   try {
//      fetch(`/api/dc?fid=${fid}&username=${username}`);

//   } catch (err) {
//     console.error("Error sendinding DC from warpcast", err);
//   }
// }, []);
// const [followData, setFollowData] = useState<FollowResponse | null>(null);

// const followBack = useCallback(async (fid: string) => {
//   try {
//     const followResponse = await fetch(`/api/follows?fid=${fid}`);
//     if (!followResponse.ok) {
//       throw new Error(`Fid HTTP error! Status: ${followResponse.status}`);
//     }
//     const followResponseData = await followResponse.json();

//     if (
//       followResponseData
//         ) {
//         setFollowData({
//         followBack: followResponseData.isFollowing,
//       });
//     } else {
//       throw new Error("Invalid response structure");
//     }
//   } catch (err) {
//     console.error("Error fetching followBack data", err);
//   }

// }, []);

const [rainboardData, setRainboardData] = useState<rainboardResponse | null>(null);

const fetchrainboard = useCallback(async () => {
  try {
    const rainBoardResponse = await fetch(`/api/rainLeaderboard`);
    if (!rainBoardResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${rainBoardResponse.status}`);
    }

    const rainLeaderResponseData = await rainBoardResponse.json();
    if (
      rainLeaderResponseData &&
      Array.isArray(rainLeaderResponseData.rainboardData)
    ) {
      setRainboardData({
        rainLeaderData: rainLeaderResponseData.rainboardData,
        
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching leaderboard", err);
  }
}, []);
const [pricerData, setPriceData] = useState<PriceResponse | null>(null);

const price = useCallback(async () => {
  try {
    const priceResponse = await fetch(`/api/onchainData`);
    if (!priceResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${priceResponse.status}`);
    }
    const priceResponseData = await priceResponse.json();

    if (
      priceResponseData
        ) {
          setPriceData({
        price: priceResponseData.price,
        t24: priceResponseData.priceChange24h,
        t1: priceResponseData.priceChange1h,
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching price data", err);
  }

}, []);
const [allowanceboardData, setAllowanceboardData] = useState<allowanceboardResponse | null>(null);

const fetchAllowanceboard = useCallback(async () => {
  try {
    const allowanceBoardResponse = await fetch(`/api/allowanceLeader`);
    if (!allowanceBoardResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${allowanceBoardResponse.status}`);
    }

    const allowanceLeaderResponseData = await allowanceBoardResponse.json();
    if (
      allowanceLeaderResponseData &&
      Array.isArray(allowanceLeaderResponseData.allowanceBoardData)
    ) {
      setAllowanceboardData({
      allowLeaderData: allowanceLeaderResponseData.allowanceBoardData,
        
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching leaderboard", err);
  }
}, []);

const [profileData, setProfileData] = useState<ProfileResponse >();

const fetchProfile = useCallback(async (fid: string) => {
  try {
    const profileResponse = await fetch(`/api/profile?fid=${fid}`);
    if (!profileResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${profileResponse.status}`);
    }
    const profileResponseData = await profileResponse.json();
    setProfileData({
      pfpUrl: profileResponseData.pfpUrl,
      username: profileResponseData.username,
      display_name: profileResponseData.display_name,
      fids: profileResponseData.fids
        
      });
  } catch (err) {
    console.error("Error fetching rain data", err);
  }

}, []);

const headers: { Home: string; AllowanceTable: string; TipsTable: string; Leaderboard: string } = {
  Home: "$DEGEN Stats",
  AllowanceTable: "Allowance Tracker",
  TipsTable: "Tips Tracker",
  Leaderboard: "Leaderboard",
};

const hasFetched = useRef(false);

useEffect(() => {
  if (!hasFetched.current) {
    fetchLeaderboard();
    fetchrainboard()
    fetchAllowanceboard()
    price()
    hasFetched.current = true; // Prevents future executions
  }
}, []);
useEffect(() => {
  if (context?.user.fid) {
    // followBack(String(context.user.fid));
    fetchAllowance(String(context.user.fid));
    fetchPoints(String(context.user.fid));
    fetchTips(String(context.user.fid));
    fetchRain(String(context.user.fid));
    fetchProfile(String(context.user.fid));
  } 
}, [context?.user.fid]);
useEffect(() => {
  if (refid) {
    fetchAllowance(String(refid));
    fetchPoints(String(refid));
    fetchTips(String(refid));
    fetchRain(String(refid));
    fetchProfile(String(refid));
  } 
}, [refid]);

const STORAGE_KEY = "lastVisitDate";


// useEffect(() => {
//   if (followData && followData?.followBack === "no") {
//     sdk.actions.viewProfile({ fid: 268438 })
//     dc(String(context?.user.fid),String(context?.user.username)); 

//   }
// }, [followData]);
const getNextResetTimes = () => {
  const now = new Date();
  const utcNow = now.getTime();

  const intervals = [0, 6, 12, 18]; // Every 6 hours from midnight
  let nextIntervalReset = null;
  for (const hour of intervals) {
    const resetTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0);
    if (resetTime > utcNow) {
      nextIntervalReset = resetTime;
      break;
    }
  }
  if (!nextIntervalReset) {
    nextIntervalReset = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
  }

  let dailyReset = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 2, 5, 0);
  if (dailyReset <= utcNow) {
    dailyReset = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 2, 5, 0);
  }

  return {
    dailyReset,
    nextIntervalReset
  };
};
const CountdownTimer = () => {
  const [timeLefts, setTimeLefts] = useState(() => {
    const { dailyReset, nextIntervalReset } = getNextResetTimes();
    return {
      daily: Math.max(dailyReset - Date.now(), 0),
      interval: Math.max(nextIntervalReset - Date.now(), 0)
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const { dailyReset, nextIntervalReset } = getNextResetTimes();
      setTimeLefts({
        daily: Math.max(dailyReset - Date.now(), 0),
        interval: Math.max(nextIntervalReset - Date.now(), 0)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="text-center border-b border-lime-400">
      <p>Allowance refreshes in {formatTime(timeLefts.daily)}</p>
      <p>Points will be updated in {formatTime(timeLefts.interval)}</p>
    </div>
  );
};

const handleClick = () => {
  addFrame(); // Call the existing addFrame function
  setClicked(true); // Update text to "Added"
};
const formatSnapshotDay = (dateString: string) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}-${month}`;
};
const rem=allowanceData?.data[0]?.remaining_tip_allowance || 0
const shareTextData = encodeURIComponent(
  `My $DEGEN stats \n \nframe by @cashlessman.eth`
);
// const shareText = encodeURIComponent(
//   `$DEGEN stats \n \nframe by @cashlessman.eth`
// );

const tiped =  encodeURIComponent(
`${rem} $DEGEN`
);
const fid= context?.user.fid;

const shareUrlData = `https://warpcast.com/~/compose?text=${shareTextData}&embeds[]=https://degen-v2.vercel.app?fid=${fid}&${Date.now()}`;
// const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://degen-v2.vercel.app`;
// const sendDC = `https://warpcast.com/~/inbox/create/268438?text=Hey! I'm unable to access the frame, can you please check.`;

const tipUrl = `https://warpcast.com/~/compose?text=${tiped}&parentCastHash=0xefeba64cabdcfbc619b7d6003f993f460e3a6cef`;
const calculateRanks = (data: rainleader[]): rainleader[] => {
  let rank = 1;
  return data.map((item, index, array) => {
    if (index > 0 && item.points !== array[index - 1].points) {
      rank = index + 1;
    }
    return { ...item, rank };
  });
};

const rankedData: rainleader[] = rainboardData?.rainLeaderData
? calculateRanks([...rainboardData.rainLeaderData].sort((a, b) => Number(b.points) - Number(a.points)))
: [];
const totalValidTip = tipsData?.tipsData
.filter(entry => entry.tip_status === "valid")
.reduce((sum, entry) => sum + Number(entry.tip_amount), 0)|| 0;

const totalInvalidTip = tipsData?.tipsData
.filter(entry => entry.tip_status !== "valid")
.reduce((sum, entry) => sum + Number(entry.tip_amount), 0)|| 0;
const TotalTips= totalValidTip+ totalInvalidTip
// alert (totalInvalidTip)
const priceValue = pricerData?.price || 0;
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

// if (followData && followData?.followBack === "no")
//  return (
//       <IsFollowing/>
//       );

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

      <header className="bg-slate-800 text-white py-2 flex flex-row items-center">
  {/* First div - Sidebar */}
  <div className="flex-none pl-3">
    <MobileSidebar />
  </div>

  {/* Spacer div to push the second div to center */}
  <div className="flex-grow"></div>

  {/* Second div - Centered Text */}
  <div className="text-center text-2xl font-bold text-sky-400">
    {headers[activeDiv]}
  </div>

  {/* Spacer div to balance layout */}
  <div className="flex-grow"></div>
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
          <LeaderBoard/>        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white p-3 font-bold">
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
  function LeaderBoard( ) {
    return (

      <div className="w-auto bg-slate-900 flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}

      <header >
    <div className="container mx-auto px-4 text-center text-white">
        <div className="flex justify-around">
          <button
            className={`p-2 ${
              activeBoard === 'RainBoard' ? 'border-b-4 border-sky-400 text-sky-400 font-bold' : ''
            }`}
            onClick={() => setActiveBoard('RainBoard')}
          >
            Raindrops
          </button>
          <button
            className={`p-2 ${
              activeBoard === 'PointsBoard' ? 'border-b-4 border-sky-400 text-sky-400 font-bold' : ''
            }`}
            onClick={() => setActiveBoard('PointsBoard')}
          >
            Points
          </button>
          <button
            className={`p-2 ${
              activeBoard === 'AllowanceBoard' ? 'border-b-4 border-sky-400 text-sky-400 font-bold' : ''
            }`}
            onClick={() => setActiveBoard('AllowanceBoard')}
          >
            Allowance
          </button>

        </div>
   </div>
  </header>

      {/* Body */}
      <main className="flex-grow overflow-auto">
        {activeBoard === 'RainBoard' && (
          <RainLeaderboard/>
        )}
        {activeBoard === 'PointsBoard' && (
          <PointsBoard/>
        )}
        {activeBoard === 'AllowanceBoard' && (
          <AllowanceBoard/>
        )}

      </main>

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
<div className="w-auto bg-slate-900 text-white mt-3 mx-2 flex flex-col justify-between h-[calc(100vh-130px)]">
  <Search/>
  <Stats />
  <CountdownTimer/>
  <div className="flex flex-row">
  <Sum/>  <Price/>
  </div>
 
 <Mint/>
<Claim/>
  <Details />
</div>

    );
  }

  function Details () {
    // className="text-white text-center py-3 rounded-xl font-semibold text-lg shadow-lg relative overflow-hidden transform transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center gap-2"

    return(
      <div className="flex flex-col">
         <div
  // className="bg-[#8B5CF6] p-3 mt-2 mx-2 justify-self-center flex-1 text-center cursor-pointer"
  className={`bg-[#8B5CF6] font-semibold rounded-xl p-3 mt-2 justify-self-center flex-1 text-center cursor-pointer  ${context?.client.added ? "hidden" : ""}`}
  onClick={handleClick}
  >
{clicked ? addFrameResult : "Add Frame"}</div>
  <div className="text-base/6 font-semibold">

    <div className="flex flex-row justify-self-center w-full">



{/* <div
  className="bg-[#8B5CF6] p-3 mt-2 ml-2 flex flex-col flex-1 items-center justify-center text-center cursor-pointer"
  onClick={() => sdk.actions.openUrl(shareUrl)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
    />
  </svg>

</div> */}
      
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
    <div className="flex flex-row justify-self-center w-full mb-2">



    {/* <div
      className="bg-[#8B5CF6] p-3 text-center mt-2 ml-2 text-base/6 font-semibold flex-1 cursor-pointer"
      onClick={()=> sdk.actions.close()}
    >
      Close Frame
    </div> */}
    </div>
  </div>
  </div>
    )}
  function Stats( ) {
    return (
      <div className="flex flex-col w-full bg-[#1e293b] text-white border-2 border-lime-400 text-xl mt-2">
      <div className="flex items-center justify-center text-white mt-3">
        <img
          src={profileData?.pfpUrl}
          alt="Profile"
          className="w-14 aspect-square rounded-lg mr-4"
        />
        <div className="flex flex-col">
          <span className="flex">{profileData?.display_name ?? "Anonymous"}</span>
          <span className="flex text-gray-400">@{profileData?.username ?? "unknown"}</span>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center text-[#885aee] mt-1 gap-3">
        <div className="flex text-lg">Allowance Rank: {allowanceData?.data[0]?.user_rank ?? "N/A"}</div>
        <div className="flex text-lg">Points Rank: {pointsData?.pointsRank ?? "N/A"}</div>

   
        </div>
        <div className="flex flex-col w-full text-[#86e635]">

        <div className="flex flex-row justify-between px-12">
          <span>Allowance:</span>
          <span>{allowanceData?.data[0]?.tip_allowance ?? "N/A"}</span>
        </div>

        <div className="relative flex flex-row justify-between items-center px-2 mx-10 border border-[#8B5CF6] rounded-lg overflow-hidden">
  {/* Background Progress Bar (Remaining Amount, Right-Aligned) */}
  <div
    className="absolute top-0 right-0 h-full bg-[#8B5CF6] transition-all duration-300"
    style={{
      width: `${
        allowanceData?.data[0]?.remaining_tip_allowance && allowanceData?.data[0]?.tip_allowance
          ? (Number(allowanceData?.data[0]?.remaining_tip_allowance) / Number(allowanceData?.data[0]?.tip_allowance)) * 100
          : 0
      }%`,
    }}
  />

  {/* Content */}
  <div className="relative flex justify-between w-full font-medium">
    <span>Remaining:</span>
    {Array.isArray(allowanceData?.data) && allowanceData?.data.length > 0 && (
        <span>
          ({((Number(allowanceData?.data[0]?.remaining_tip_allowance) / Number(allowanceData?.data[0]?.tip_allowance)) * 100).toFixed(1) ?? "N/A"}%)
        </span>
      )}
    <div className="flex">
      <span>{allowanceData?.data[0]?.remaining_tip_allowance ?? "N/A"}</span>

    </div>
  </div>
</div>


        <div className="flex flex-row justify-between px-12">
          <span >Points:</span>
          <span >{pointsData?.points ?? "0"}</span>

        </div>
        <div className="flex flex-row justify-between px-12 mb-1">
          <span >Raindrops:</span>
          <span >{rainData?.rainPoints ?? "0"}</span>

        </div>
        </div>
    </div>
    );
  }

  function AllowanceTable( ) {
    return (
      <div className="bg-[#1E293B] h-[calc(100vh-130px)] overflow-auto">
        {/* <header className="bg-slate-800 text-white py-4">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-2xl font-bold text-sky-400 sticky top-0 z-10">Allowance Tracker</h1>
    </div>
  </header> */}

        <table className="table-auto w-full bg-slate-700 text-lime-400 text-center">
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
                allowanceData.data.map((item, index) => (
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
      <div className="bg-[#1E293B] h-[calc(100vh-130px)] overflow-auto">
  {/* <h1 className="text-2xl font-bold text-sky-400 text-center p-2 pt-0">
    Tips Tracker
  </h1> */}

  <table className="table-auto w-full bg-slate-700 text-lime-400 text-center">
    <thead className="sticky top-0 bg-slate-700">
      <tr className="text-white text-violet-400 border-b border-lime-400">
        <th className="py-2  min-w-[80px]">Date</th>
        <th className="py-2">Receiver <br/> FID</th>
        <th className="py-2">Tip<br/> Amount</th>
        <th className="py-2">Tip<br/> Status</th>
        <th className="py-2">View<br/> cast</th>

      </tr>
    </thead>
    {Array.isArray(tipsData?.tipsData) && tipsData?.tipsData.length > 0 ? (
 <tbody>
 {Array.isArray(tipsData?.tipsData) &&
tipsData.tipsData.map((item, index) => (
<tr
key={index} className="odd:bg-slate-700 even:bg-slate-600">
   
       <td className="px-4 py-2">
       {formatSnapshotDay(item?.snapshot_day ?? "N/A")}
       </td>
       <td className="px-4 py-2 cursor-pointer" onClick={()=>sdk.actions.viewProfile({ fid: Number(item?.recipient_fid) })}>{item?.recipient_fid ?? "N/A"}</td>
       <td className="px-4 py-2">{item?.tip_amount ?? "N/A"}</td>
       <td className={item?.tip_status === "invalid" ? "text-red-500" : ""}>{item?.tip_status ?? "N/A"}</td>
       <td className="px-4 py-2 text-3xl cursor-pointer" onClick={()=>sdk.actions.openUrl(`https://warpcast.com/~/conversations/${(item?.cast_hash).replace(/\\/, '0')}`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>
</td>
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
  function PointsBoard( ) {
    return (
      <div className="bg-[#1E293B] overflow-auto">
  {/* <h1 className="text-2xl font-bold text-sky-400 text-center p-2 pt-0">
    Leaderboard
  </h1> */}

  <table className="table-auto w-full bg-slate-700 text-lime-400 text-center">
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
  <div className="flex items-center" onClick={()=>sdk.actions.viewProfile({ fid: Number(profileData?.fids) })}>
    <img
      src={profileData?.pfpUrl}
      alt="Profile"
      className="w-10 h-10 rounded-lg mr-4"
    />
     @{profileData?.username?? "N/A"}
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
      profileData?.fids ?.toString() === item?.fid
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
  
  function RainLeaderboard( ) {
    return (
      <div className="bg-[#1E293B] overflow-auto">
      <table className="table-auto w-full bg-slate-700 text-lime-400 text-center">
        <thead className="sticky top-0 bg-slate-700">
          <tr className="text-white text-violet-400 lime-400 border-b border-lime-400">
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {rankedData.map((item, index) => (
            <tr
              key={index}
              className={`odd:bg-slate-700 even:bg-slate-600 ${
                profileData?.fids?.toString() === item.fid ? "border-2 border-lime-400" : ""
              }`}
            >
              <td className="px-4 py-2">{item.rank}</td>
              <td className="px-4 py-2">
                <div
                  className="flex items-center"
                  onClick={() => sdk.actions.viewProfile({ fid: Number(item.fid) })}
                >
                  <img
                    src={item.avatar_url}
                    alt="Profile"
                    className="w-10 h-10 rounded-lg mr-4"
                  />
                  @{item.fname ?? "N/A"}
                </div>
              </td>
              <td className="px-4 py-2">{item.points ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    );
  }
  
    function AllowanceBoard(){
    return (
      <div className="bg-[#1E293B] overflow-auto">
  {/* <h1 className="text-2xl font-bold text-sky-400 text-center p-2 pt-0">
    Leaderboard
  </h1> */}

  <table className="table-auto w-full bg-slate-700 text-lime-400 text-center">
    <thead className="sticky top-0 bg-slate-700">
      <tr className="text-white text-violet-400 lime-400">
        <th className="px-4 py-2">Rank</th>
        <th className="px-4 py-2">FID</th>
        <th className="px-4 py-2">Allowance</th>
        <th className="px-4 py-2">Remaining</th>



      </tr>
    </thead>
 <tbody>
 <tr className="border-2 border-lime-400">
    <td className="px-4 py-2">
  {allowanceData?.data[0]?.user_rank ?? "N/A"}    </td>
       <td className="px-4 py-2">
  <div className="flex items-center cursor-pointer" onClick={()=>sdk.actions.viewProfile({ fid: Number(profileData?.fids) })}>
    {/* <img
      src={context?.user.pfpUrl}
      alt="Profile"
      className="w-10 h-10 rounded-lg mr-4"
    /> */}
     {profileData?.fids ?? "N/A"}
  </div>
</td>


       <td className="px-4 py-2">{allowanceData?.data[0]?.tip_allowance ?? "N/A"}</td>
       <td className="px-4 py-2">{allowanceData?.data[0]?.remaining_tip_allowance ?? "N/A"}</td>

  </tr>
 {Array.isArray(allowanceboardData?.allowLeaderData) &&
allowanceboardData.allowLeaderData.map((item, index) => (
<tr
key={index}
//  className="odd:bg-slate-700 even:bg-slate-600">
     className={`odd:bg-slate-700 even:bg-slate-600 ${
      profileData?.fids?.toString() === item?.fid
      ? "border-2 border-lime-400" : ""
  }`}>
       <td className="px-4 py-2">
       {item?.user_rank }
       </td>
       <td className="px-4 py-2">
  <div className="flex items-center cursor-pointer" onClick={()=>sdk.actions.viewProfile({ fid: Number(item?.fid) })}>
    {/* <img
      src={item?.avatar_url}
      alt="Profile"
      className="w-10 h-10 rounded-lg mr-4"
    /> */}
    {item?.fid ?? "N/A"}
  </div>
</td>
       <td className="px-4 py-2">{item?.tip_allowance ?? "N/A"}</td>
       <td className="px-4 py-2">{item?.remaining_tip_allowance ?? "N/A"}</td>

     </tr>
   ))}
</tbody>
  </table>
</div>  

    );
  }
// function IsFollowing( ) {
//     return (
// <div className="w-auto bg-slate-900 flex flex-col h-screen">
// <header className="bg-slate-800 py-3">
//     <div className="container px-4 text-center">
//       <h1 className="text-2xl font-bold text-sky-400">{headers[activeDiv]}</h1>
//     </div>
//   </header>
//   <div className="text-center px-10 py-5 mt-10 font-bold text-lime-400 text-2xl h-[calc(100vh-140px)]">
//   Follow cashlessman.eth to access this Frame
//   <div
//   className="bg-[#8B5CF6] p-3 mt-3 text-base font-semibold cursor-pointer text-white flex items-center justify-center gap-2"
//   onClick={() => sdk.actions.viewProfile({ fid: 268438 })}
// >
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     strokeWidth={1.5}
//     stroke="currentColor"
//     className="size-6"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
//     />
//   </svg>
//   Follow
// </div>

//       <div
//       className="text-center mt-7 text-sm font-semibold text-white"
//       >If you just followed, please wait a few minutes for the system to sync your data, Add this frame and come back later.
//       </div>
//       <div
//   className={`bg-[#8B5CF6] p-3 mt-2 justify-self-center flex-1 text-center text-white cursor-pointer ${context?.client.added ? "hidden" : ""}`}
//   onClick={handleClick}
//   >
// {clicked ? "Frame Added" : "Add Frame"}</div>
//       <div
//       className="text-center mt-7 text-sm font-semibold text-white"
//       >If you were already following cashlessman.eth (not just now) and still can&apos;t access this frame, please send a DC.
//       </div>
//       <div
//   className="bg-[#8B5CF6] p-3 mt-3 text-base font-semibold cursor-pointer text-white flex items-center justify-center gap-2"
//   onClick={() => sdk.actions.openUrl(sendDC)}
// >
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     strokeWidth={1.5}
//     stroke="currentColor"
//     className="size-6"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
//     />
//   </svg>
//   Send DC
// </div>

//   </div>

// </div>


//     );
//   }
function Sum( ) {
  return (
    <div className="flex flex-col w-1/2 text-base border-r border-gray-300 px-3">
<div className="text-center">Tips given</div>
      <div className="flex flex-row justify-between">
        <span className="text-green-500">Valid:</span>
        <span className="text-green-500">
         {totalValidTip}  |  ${(totalValidTip * priceValue).toFixed(2)}
        </span>
      </div>
      <div className="flex flex-row justify-between">
        <span className="text-red-500">Invalid:</span>
        <span className="text-red-500">
          {totalInvalidTip}  |  ${(totalInvalidTip * priceValue).toFixed(2)}
        </span>
      </div>
      <div className="flex flex-row justify-between">
        <span>Total:</span>
        <span>
          {TotalTips}  |  ${(TotalTips * priceValue).toFixed(2)}
        </span>
      </div>
    
    </div>
        )
}
  function Price(){
    return (
<div className="flex flex-col w-1/2 text-base px-3">
<div className="text-center">Price</div>

  <div className="flex flex-row justify-between">
    <span className="text-[#38BDf8]">1 $DEGEN:</span>
    <span className="text-[#38BDf8]">${pricerData?.price ?? "N/A"}</span>
  </div>
  <div className="flex flex-row justify-between">
    <span className={pricerData?.t1 != null && pricerData.t1 >= 0 ? "text-green-500" : "text-red-500"}>1H Change:</span>
    <span className={pricerData?.t1 != null && pricerData.t1 >= 0 ? "text-green-500" : "text-red-500"}>
      {pricerData?.t1 ?? "N/A"}%
    </span>
  </div>
  <div className="flex flex-row justify-between">
    <span className={pricerData?.t24 != null && pricerData.t24 >= 0 ? "text-green-500" : "text-red-500"}>24H Change:</span>
    <span className={pricerData?.t24 != null && pricerData.t24 >= 0 ? "text-green-500" : "text-red-500"}>
      {pricerData?.t24 ?? "N/A"}%
    </span>
  </div>


</div>
    )
  }
  function Search (){
    const [searchValue, setSearchValue] = useState("");
    const handleShare = () => {
      setShared(true);
      sdk.actions.openUrl(tipUrl);
    };

    const fetchfid= useCallback(async (searchValue: string) => {
try{
  const username= searchValue.includes("@") ? searchValue.replace("@", "") : searchValue;

  const pinataUrl= `https://hub.pinata.cloud/v1/userNameProofByName?name=${username}`
  const pinataResponse = await axios.get(pinataUrl);
  const pinataFid = pinataResponse.data.fid;
  // alert(pinataFid)
  setRefid(pinataFid)

}catch{
  alert("please enter a valid username")
  // console.error('Error fetching data:', error);
} },[searchValue])
    return (
      <div className="flex flex-row items-center justify-around">
              {Array.isArray(allowanceData?.data) && allowanceData?.data.length > 0 && (
        <div
  className="bg-[#8B5CF6] p-2 justify-self-center text-center cursor-pointer flex items-center justify-center rounded-lg"
  onClick={() => sdk.actions.openUrl(tipUrl)}
>
  Tip <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>
</div>

      )}
<div className="flex items-center gap-2">
<input
  className="w-[170px] p-2 bg-[#525760] text-base text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
  type="text"
  placeholder="search for username"
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      fetchfid(searchValue)
    }
  }}
/>

  <div className="bg-[#8B5CF6] p-2 rounded-lg"
      onClick={() => fetchfid(searchValue)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6 text-white cursor-pointer"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
  </div>
</div>

  <div
  className="bg-[#8B5CF6] p-2 items-center justify-center text-center cursor-pointer rounded-lg"
  onClick={handleShare}
>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
</svg>
</div>
</div>

    )
  }
function Mint(){

  const [isClicked, setIsClicked] = useState(false);


  const today = new Date().toISOString().split("T")[0]; // Get only YYYY-MM-DD
  
  const storedDate = localStorage.getItem(STORAGE_KEY);
  useEffect(() => {

  
    if (!storedDate || storedDate !== today && isConnected && pointsData?.pointsRank && rainData?.rainPoints) {
      sendTx();; // Show alert if first visit or new day
      localStorage.setItem(STORAGE_KEY, today); // Store today's date
    }
  }, []);
  const CONTRACT_ADDRESS = "0x3DB019427f05192F8FB64534CF9C0bF5cc596a80";
  const handleMint = () => {
    setIsClicked(true);
    setTimeout(() => {
      if (isConnected) {
        sendTx(); // Call sendTx when isConnected is true
      } else {
        connect({ connector: config.connectors[0] }); // Otherwise, call connect
      }
    }, 500);
    
   
    setTimeout(() => setIsClicked(false), 500); // Reset after animation
  
  };
  const sendTx = useCallback(() => {
    const data = encodeFunctionData({
      abi,
      functionName: "mintNFT",
      args: [context?.user.fid], // Only passing fid, since recipient is msg.sender
    });
    sendTransaction(
      {

        to: CONTRACT_ADDRESS,
        data,
        // value: BigInt("10000000000000") // Mint fee

      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);

        },
      }
    );
  }, [sendTransaction]);
  return (
    <div className="flex flex-col">
        <button
      onClick={handleMint}
      disabled={isSendTxPending}

      className="text-white text-center py-3 rounded-xl font-semibold text-lg shadow-lg relative overflow-hidden transform transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center gap-2"
      style={{
        background: "linear-gradient(90deg, #8B5CF6, #7C3AED, #A78BFA, #8B5CF6)",
        backgroundSize: "300% 100%",
        animation: "gradientAnimation 3s infinite ease-in-out"
      }}
    >     
      <div className={`absolute inset-0 bg-[#38BDF8] transition-all duration-500 ${isClicked ? 'scale-x-100' : 'scale-x-0'}`} style={{ transformOrigin: "center" }}></div>
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
       {isConnected ? <MintButton/> : "Connect"}
    </button>


    </div>
  
  )
}
 function MintButton(){
  return(
    <div className="flex flex-row gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 relative z-10"> 
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
      <span className="relative z-10">  {isConfirming
                        ? "Minting..."
                        : isConfirmed
                        ? "Minted!"
                        : "Mint your stats"}</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 relative z-10"> 
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg> </div>
  )
 }


//  function LocalStorage(){
//    const STORAGE_KEY = "checkboxValue";
 
//    // Retrieve initial value from localStorage or default to false
//    const [isChecked, setIsChecked] = useState<boolean>(() => {
//      const storedValue = localStorage.getItem(STORAGE_KEY);
//      return storedValue ? JSON.parse(storedValue) : false;
//    });
 
//    // Update localStorage when isChecked changes
//    useEffect(() => {
//      localStorage.setItem(STORAGE_KEY, JSON.stringify(isChecked));
//    }, [isChecked]);
 
//    return (
//      <div className="flex flex-col items-center gap-2 p-4">
//        <label className="flex items-center gap-2 cursor-pointer">
//          <input
//            type="checkbox"
//            checked={isChecked}
//            onChange={(e) => setIsChecked(e.target.checked)}
//            className="w-5 h-5"
//          />
//          <span className="text-lg">Check me</span>
//        </label>
//        <p className="text-lg">
//          {isChecked ? "Checkbox is checked ✅" : "Checkbox is unchecked ❌"}
//        </p>
//      </div>
//    );
//  };
 
 function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white bg-slate-900 rounded-md"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            exit={{ x: -200 }}
            className="fixed top-0 left-0 h-full w-2/3 bg-[#1e293b] text-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
 <X size={24} />            </button>
            <ul className="space-y-4 mt-8">

              <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                <User size={20} /> Profile
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md">
                <Settings size={20} /> Settings
              </li>
            </ul>
          </motion.div>
        </div>
      )}
    </div>
  );
}
function Claim(){

  const [isClicked, setIsClicked] = useState(false);


  const today = new Date().toISOString().split("T")[0]; // Get only YYYY-MM-DD
  
  const storedDate = localStorage.getItem(STORAGE_KEY);
  useEffect(() => {

  
    if (!storedDate || storedDate !== today && isConnected && pointsData?.pointsRank && rainData?.rainPoints) {
      sendTx();; // Show alert if first visit or new day
      localStorage.setItem(STORAGE_KEY, today); // Store today's date
    }
  }, []);
  const CONTRACT_ADDRESS = "0x348775AC50b487Bb73551b2DEe0842aed2B30922";
  const handleClaim = () => {
    setIsClicked(true);
    setTimeout(() => {
      if (shared) {
        sendTx(); // Call sendTx when isConnected is true
      } else {
        setShared(true)
        sdk.actions.openUrl(shareUrlData); // Otherwise, call connect
      }
    }, 500);
    
   
    setTimeout(() => setIsClicked(false), 500); // Reset after animation
  
  };
  const sendTx = useCallback(() => {
    const data = encodeFunctionData({
      abi:claimAbi,
      functionName: "claim",
      args: [], 
    });
    sendTransaction(
      {

        to: CONTRACT_ADDRESS,
        data,
        // value: BigInt("10000000000000") // Mint fee

      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);

        },
      }
    );
  }, [sendTransaction]);
  return (
    <div className="flex flex-col gap-2 mt-2">
<button
  onClick={handleClaim}
  disabled={isSendTxPending}
  className="text-white flex-1 text-center py-3 rounded-xl font-semibold text-lg shadow-lg relative overflow-hidden transform transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center gap-2"
  style={{
    background: "linear-gradient(90deg, #8B5CF6, #7C3AED, #A78BFA, #8B5CF6)",
    backgroundSize: "300% 100%",
    animation: "reverseGradient 3s infinite ease-in-out"
  }}
>
  <div
    className={`absolute inset-0 bg-[#38BDF8] transition-all duration-500 ${
      isClicked ? "scale-x-100" : "scale-x-0"
    }`}
    style={{ transformOrigin: "center" }}
  ></div>

  <style>{`
    @keyframes reverseGradient {
      0% { background-position: 100% 50%; }
      50% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
  `}</style>

  {shared ? <ClaimButton /> : "Share The mini-app to claim 10 $DEGEN"}
</button>

    <div >
    <a href="https://app.degen.tips/"
      className="text-white flex-1 text-center py-3 rounded-xl font-semibold text-lg shadow-lg relative overflow-hidden transform transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center gap-2"
      style={{
        background: "linear-gradient(90deg, #8B5CF6, #7C3AED, #A78BFA, #8B5CF6)",
        backgroundSize: "300% 100%",
        animation: "gradientAnimation 3s infinite ease-in-out"
      }}
    >
      Claim Season Rewards
    </a>
                </div>
                
    </div>
  
  )
}

function ClaimButton(){
  return(
    <div className="flex flex-row gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 relative z-10"> 
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
      <span className="relative z-10">  {isConfirming
                        ? "Claiming..."
                        : isConfirmed
                        ? "Claimeded!"
                        : "Claim 10 Degen"}</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 relative z-10"> 
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg> </div>
  )
 }
 
}
// const renderError = (error: Error | null) => {
//   if (!error) return null;
//   if (error instanceof BaseError) {
//     const isUserRejection =
//     error instanceof UserRejectedRequestError ||
//     (error.cause && error.cause instanceof UserRejectedRequestError);
  

//     if (isUserRejection) {
//       return <div className="text-red-500 text-xs mt-1">Click again to Mint</div>;
//     }
//   }

//   return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
// };