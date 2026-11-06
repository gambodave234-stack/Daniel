# ChainLab — Blockchain Consensus Simulator

A beginner-friendly browser simulation built to demonstrate blockchain structure, Proof of Work (PoW), a simplified Proof of Stake (PoS) model, and tamper detection.

## Run it

No package installation is required.

1. Download or clone this repository.
2. Open the folder in Visual Studio Code.
3. Start a local web server. The easiest option is the **Live Server** extension: right-click `index.html` and choose **Open with Live Server**.
4. Alternatively, if Python is installed, run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.

A modern browser with the Web Crypto API is required. HTTPS or localhost is recommended.

## Try the simulation

1. Add a transaction (for example, Alice sends 12.5 to Bob).
2. Mine with Proof of Work. Change the difficulty slider and observe how many hash attempts are needed.
3. Add another transaction and use the simplified Proof of Stake button.
4. Compare the computational-work indicators.
5. Use the tamper test to alter a confirmed block. The chain should report an integrity failure because the block data no longer matches its stored hash.
6. Press **Reset demo** to restore the genesis block.

## What the model demonstrates

- A block stores transactions, a timestamp, a nonce, a previous-block hash, and its own SHA-256 hash.
- Proof of Work searches for a hash with a configurable number of leading zeroes.
- Changing block data invalidates its stored hash and breaks chain integrity.
- The PoS button is intentionally a simplified one-step validator-selection illustration. It is **not** a full PoS implementation and does not model real staking economics, validator voting, slashing, or network finality.
- The energy figure is a relative teaching indicator derived from the number of simulated PoW hash attempts. It is not a measurement of real electricity consumption.

## Limitations

This is a single-browser educational model. It does not connect peer-to-peer nodes, persist data to a database, issue cryptocurrency, use real wallets, or provide production-grade security. The PoW search is deliberately small and should not be treated as a benchmark of public blockchains.

## Project structure

- `index.html` — page structure and controls
- `style.css` — responsive interface styling
- `app.js` — block creation, SHA-256 hashing, consensus demonstrations, validation, and tamper test

## Suggested experiment

Mine several blocks at difficulty 1, then reset and repeat at difficulty 4. Record the number of attempts for each run. Compare the results and explain why PoW computation increases as the target becomes harder.
