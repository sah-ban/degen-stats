import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

// const frame = {
//   version: "next",
//   imageUrl: `${appUrl}/opengraph-image`,
//   button: {
//     title: "Launch Frame",
//     action: {
//       type: "launch_frame",
//       name: "Farcaster Frames v2 Demo",
//       url: appUrl,
//       splashImageUrl: `${appUrl}/splash.png`,
//       splashBackgroundColor: "#f7f7f7",
//     },
//   },
// };
const frame = {
  version: "next",
imageUrl: `https://raw.githubusercontent.com/cashlessman/images/refs/heads/main/degen.png`,  
  button: {
    title: "Check Your $DEGEN Stats",
    action: {
      type: "launch_frame",
      name: "$DEGEN STATS",
      url: appUrl,
      splashImageUrl: `https://raw.githubusercontent.com/cashlessman/images/refs/heads/main/pfp.png`,
      splashBackgroundColor: "#333333",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcaster Frames",
    openGraph: {
      title: "Farcaster Frames",
      description: "A Farcaster Frames app.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (<App />);
}
