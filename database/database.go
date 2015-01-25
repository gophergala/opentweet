package database

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gophergala/opentweet/protocol"
	"log"
	"time"
)

type DB struct {
	db *sql.DB
}

func NewDB() (DB, error) {
	var newDB DB
	//db, err := sql.Open("mysql", "root:mysecretpassword@tcp(mysql:3306)/")
	db, err := sql.Open("mysql", "root:mysecretpassword@tcp(localhost:3306)/")
	if err != nil {
		return newDB, fmt.Errorf("Error opening db: %v", err)
	}

	_, err = db.Exec(
		"CREATE DATABASE IF NOT EXISTS opentweet;")
	if err != nil {
		return newDB, fmt.Errorf("Error creating db: %v", err)
	}

	_, err = db.Exec(
		"USE opentweet;")
	if err != nil {
		return newDB, fmt.Errorf("Error using db: %v", err)
	}

	_, err = db.Exec(
		"CREATE TABLE IF NOT EXISTS users " +
			"(name VARCHAR(32) PRIMARY KEY, password VARCHAR(32));")
	if err != nil {
		return newDB, fmt.Errorf("Error creating table: %v", err)
	}

	log.Printf("Database connected and setup")
	newDB.db = db
	return newDB, nil
}

func GetTweets(name string, from, to time.Time) ([]protocol.Tweet, error) {
	tweets := make([]protocol.Tweet, 5)
	tweets[0] = protocol.Tweet{time.Now().Add(-5 * time.Minute), "t1"}
	tweets[1] = protocol.Tweet{time.Now().Add(-4 * time.Minute), "t2"}
	tweets[2] = protocol.Tweet{time.Now().Add(-3 * time.Minute), "t3"}
	tweets[3] = protocol.Tweet{time.Now().Add(-2 * time.Minute), "t4"}
	tweets[4] = protocol.Tweet{time.Now().Add(-1 * time.Minute), "t5"}
	return tweets, nil
}

func (db DB) RegisterUser(name, password string) error {
	log.Printf("Registering new user: %v", name)

	_, err := db.db.Exec(
		"INSERT INTO users (name, password)" +
			"VALUES (?, ?);",
		name,
		password,
	)
	if err != nil {
		return fmt.Errorf("Error inserting user: %v", err)
	}
	return nil
}

func (db DB) PostTweet(user, password, tweet string) error {
	rows, err := db.db.Query(
		"SELECT password FROM users WHERE name = ?;", user)
	if err != nil {
		return fmt.Errorf("Error finding user: %v", err)
	}
	//should be 1 row
	ok := rows.Next()
	if ok != true {
		err = rows.Err()
		return fmt.Errorf("Error geting user row: %v", err)
	}
	var dbPass string
	err = rows.Scan(&dbPass)
	if err != nil {
		return fmt.Errorf("Error getting user password: %v", err)
	}
	rows.Close()

	if password != dbPass {
		return fmt.Errorf("Error invalid password")
	}

	log.Printf("user %v posted tweet %v", user, tweet)
	return nil
}
