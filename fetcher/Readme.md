# Fetcher

## Requirements

- Node 6+

## Install

    # create a PostgreSQL database
    createdb sm-fetcher
    # create tables
    psql -d sm-fetcher -f ../db/init-schema.sql
    # install dependencies
    npm install
    # start web server
    npm run dev
    
## Usage

Use `curl` or `postman` or similar for the following:

1. [Generate a GUID](https://www.guidgen.com/)
2. [Create a Twitter app](https://apps.twitter.com/) or use an exiting one
3. `POST http://locahlost:8081/registration/register` with `{"applicationId":"<YOUR GUID>"}`
4. `POST http://locahlost:8081/twitter/register` with `{"applicationId":"<YOUR GUID>", "twitterId":"<TWITTER CONSUMER KEY>", "twitterSecret":"<TWITTER CONSUMER SECRET>"}`
5. ???
6. Profit!   
    