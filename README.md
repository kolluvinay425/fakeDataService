# Mock Data Generator Repository

## Description

This repository is used to generate test data for all services. It generates and populates the database with data to facilitate testing for developers.

## Running the Project

1. Set up your environment variables in a `.env` file:

   ```
   PORT
   MONGO_URI
   JWT_SECRET
   ```

2. Install the required packages:

   ```bash
   npm install
   ```

3. Run the data generator:

   ```bash
   npm run start
   ```

   If you want to run the project in development mode, you can use:

   ```
   npm run start:dev

   ```

## Authentication

1. Before generating data, you need to authenticate yourself. Send the following data in your HTTP client:

   ```
   URL: POST /api/v1/users/:userId/tokens

   BODY: {
      password: "your_password"
   }
   ```

## Generate Mock Data

### 1. Generating mock data for teams

To generate mock data for teams and create team members, use the following API:

```
URL: POST /api/v1/teams
BODY: {}
```
