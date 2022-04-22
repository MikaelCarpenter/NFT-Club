# NFT Club

## 💡 Inspiration

As far as we know, a Patreon-esque dApp did not exist on the Solana blockchain. In fact, a similar project was proposed at the Solana Riptide Hackathon, and it was a stretch goal of ours to submit this as our entry. We felt that building an app empowering creators in web3 would not only be novel, but would teach us a lot about development in this fast-growing ecosystem. In the end, due to starting late and the learning curve being much steeper than anticipated (this was our first Solana project), we were not able to submit on time. However, we still built a dApp we are proud of and learned a ton in the process!

## 💻 What It Does

NFT Club is a Patreon-inspired dApp allowing creators to gain a following and provide unique benefits to their fans. Fans support creators with SOL by subscribing for benefits that the creators provide. As this application is 100% on chain, there is no person or platform in the middle dictating what is or is not allowed or taking a cut of a creator's revenue. This empowers creators both in terms of freedom and financially, allowing them to reap maximum reward for their work.

The three main pillars of this dApp are Creators, Benefits, and Subscriptions. Creators authenticate through their wallet, create Benefits they offer to their subscribers, have the ability to modify their relevant data and offerings through a Creator Hub, and have their own landing page for themselves and other users to view.

Benefits are constituted by a name, description, and an access link. The link is in place to route users to a page with relevant details of the Benefit offered.

Lastly, Subscriptions are the vehicle through which users support Creators, gaining access to the Benefits they offer and helping contribute with payments of SOL.

## ▶️ Demo

[![NFT Club Demo](https://i.imgur.com/cKjPR10.jpg)](https://www.loom.com/share/c9892eb6b47042f0b759df314083c05d 'NFT Club Demo')

## 🧠 Challenges/Learnings

- Structuring our Rust program such that we could specify how much storage Creator and Benefit instances would take up. Since Solana needs to know how much rent to charge users, a dynamically-sizing data structure would not suit us. Having an arbitrary number of Benefits for each Creator forced us to devise a workaround.
- Coming up with a way to structure our Creator and Benefit accounts to allow fetching of all Benefits pertinent to a Creator without the use of a dynamically-sizing data structure and figuring out how to create them using a PDA.
- Finding a way to delete arbitrary Benefits without causing costly operations.
- Learning how to use Rust and Anchor to define constraints and permissions for error checking and security.
- Learning more about how Solana programs work and how to clean up corrupted data

## 🏅 Accomplishments

- Completing our first full stack blockchain project
- Creating a proof of concept of a dApp that can actually be used to empower creators
- Learning how to perform CRUD operations on the Solana blockchain
- Figuring out a cheap way to store creator's benefits on chain without a dynamically-resizing data structure

## 🚀 What's Next for NFT Club

- Adding a gatekeeper for additional security
- Creating a more seamless UI and experience

## 🏃️ Installing and Running Locally

- Make sure you have Rust, Anchor, Solana, and npm/yarn installed
- Clone the repository
- In project root, run `npm install`
- Run `anchor build`
- Run `anchor deploy`
- If `anchor deploy` fails due to insufficient funds, grant yourself more devnet SOL with `solana airdrop 2`
 - If failed deploys drain your SOL and the airdrop is rate limiting you, you can use `solana program close --buffers` to retrieve the SOL from the failed deploys.
- `cd app`
- Run `npm install`
- To start the app, run `npm run dev` and go to `http://localhost:3000` in your browser
