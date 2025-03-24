// import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';
// import { NextResponse } from 'next/server';

// const httpLink = createHttpLink({
//   uri: 'https://public.zapper.xyz/graphql',
// });

// const API_KEY = process.env.ZAPER_API_KEY

// const authLink = setContext((_, { headers }) => {
//   return {
//     headers: {
//       ...headers,
//       'x-zapper-api-key': API_KEY,
//     },
//   };
// });

// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache(),
// });

// const DegenData = gql`
//   query FungibleToken {
//   fungibleToken(address: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed", network: BASE_MAINNET) {
//     onchainMarketData {
//       price
//       priceChange1h
//       priceChange24h
//     }
//   }
// }
// `;

// export async function GET() {
//   try {
//     const { data } = await client.query({
//       query: DegenData,
//     });

//     const price = data.fungibleToken.onchainMarketData.price;
//     const priceChange1h= data.fungibleToken.onchainMarketData.priceChange1h;
//     const priceChange24h= data.fungibleToken.onchainMarketData.priceChange24h;
//     // console.log(data); 
    

//     return NextResponse.json({
//       price,
//       priceChange1h,
//       priceChange24h,
//       });
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     return NextResponse.json(
//       { error: 'An unexpected error occurred' },
//       { status: 500 }
//     );
//   }
// }
import {NextResponse } from "next/server";
import axios from "axios";

export async function GET() {

  try {
    const dexApiUrl = `https://api.dexscreener.com/latest/dex/pairs/base/0x54d281c7cc029a9dd71f9acb7487dd95b1eecf5a`;
    const dexResponse = await axios.get(dexApiUrl)
  
    const price = dexResponse.data.pair.priceUsd;
    const priceChange1h= dexResponse.data.pair.priceChange.h1;
    const priceChange24h= dexResponse.data.pair.priceChange.h24;
    // console.log(price); 
    // console.log(priceChange1h); 
    // console.log(priceChange24h); 

    return NextResponse.json({
      price,
      priceChange1h,
      priceChange24h,
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

