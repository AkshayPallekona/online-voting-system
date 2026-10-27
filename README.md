# Online Voting System (Demo)

Educational demonstration of a complete Online Voting System using Node.js, Express.js, MySQL, and vanilla JavaScript with Bootstrap.

**Disclaimer:** This is an educational demo, not a certified voting platform. It does not provide cryptographic ballot secrecy, independent verification, or security guarantees required for real public elections.

## Prerequisites

- Node.js LTS (v18+)
- MySQL 8+

## Setup Instructions

1. Install Node.js and MySQL
2. Create database: `mysql -u root -p < database/schema.sql`
3. `cp .env.example .env` and configure
4. `npm install`
5. Load seed: `mysql -u root -p online_voting_system < database/seed.sql`
6. Create admin (see full README)
7. `npm start`

See the repository for complete files and instructions.
