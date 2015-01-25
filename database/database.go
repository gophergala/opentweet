package database

import (
	"github.com/gophergala/opentweet/protocol"
	"time"
	"log"
)

func GetTweets(name string, from, to time.Time) ([]protocol.Tweet, error) {
	tweets := make([]protocol.Tweet, 5)
	tweets[0] = protocol.Tweet{time.Now().Add(-5 * time.Minute), "t1"}
	tweets[1] = protocol.Tweet{time.Now().Add(-4 * time.Minute), "t2"}
	tweets[2] = protocol.Tweet{time.Now().Add(-3 * time.Minute), "t3"}
	tweets[3] = protocol.Tweet{time.Now().Add(-2 * time.Minute), "t4"}
	tweets[4] = protocol.Tweet{time.Now().Add(-1 * time.Minute), "t5"}
	return tweets, nil
}

func RegisterUser (name, password string) error {
	log.Printf("In db, got new user register: %v:%v", name, password)
	return nil
}
