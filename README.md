# opentweet



## Status

Server is up and running at `opentweet.cloudapp.net` default port of 12315

Client can be built in `client/` dir and run as `client opentweet.cloudapp.net`

Backend is not implemented, only serves 5 dummy tweets
Posting is not implemented

## Run Server

    docker build -t opentweet .
    docker run -d -p 12315:12315 opentweet

