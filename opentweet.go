package main

import (
	"github.com/gophergala/opentweet/protocol"
	"github.com/gophergala/opentweet/database"
	"log"
)

func main() {
	server := protocol.NewServer()
	err := server.Register(database.GetTweets)
	if err != nil {
		log.Fatalf("%v", err)
	}
	err = server.ListenAndServe()
	if err != nil {
		log.Fatalf("%v", err)
	}
}
