package main

import (
	"github.com/gophergala/opentweet/protocol"
	"github.com/gophergala/opentweet/database"
	"github.com/gophergala/opentweet/rest"
	"log"
)

func main() {
	go serveTweets()
	serveRest()
}

func serveRest() {
	log.Printf("serving rest?")
	server := rest.NewServer()
	err := server.RegisterUserCB(database.RegisterUser)
	if err != nil {
		log.Printf("%v", err)
		return
	}
	err = server.ListenAndServe()
	if err != nil {
		log.Printf("%v", err)
	}
}

func serveTweets() {
	log.Printf("serving tweets?")
	server := protocol.NewServer()
	err := server.Register(database.GetTweets)
	if err != nil {
		log.Printf("%v", err)
		return
	}
	err = server.ListenAndServe()
	if err != nil {
		log.Printf("%v", err)
	}
}
