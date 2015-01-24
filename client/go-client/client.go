package main

import (
	"github.com/gophergala/opentweet/protocol"
	"time"
	"fmt"
	"os"
)

func main() {
	server := os.Args[1]
	tweets, err := protocol.GetTweets(
		server,
		"asdf",
		time.Now().Add(-5 * time.Minute),
		time.Now(),
	)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	for _, val := range(tweets) {
		fmt.Printf("Time: %v\n", val.Time)
		fmt.Printf("Tweet: %v\n", val.Text)
	}
}
		
