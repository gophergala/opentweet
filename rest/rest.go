package rest

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"fmt"
)

type Server struct {
	port     int
	user UserHandler
}

type UserHandler struct {
	register UserCallback
}	

type UserCallback func(name, password string) error

var port = 8080

func NewServer() Server {
	user := UserHandler{nil}
	server := Server{port, user}
	return server
}

func (server *Server) RegisterUserCB(fn UserCallback) error {
	server.user.register = fn
	return nil
}

func (handler UserHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	type userpost struct {
		UserName string `json:"user"`
		Password string `json:"password"`
	}
	var post userpost

	if req.Method != "POST" {
		resp.WriteHeader(http.StatusBadRequest)
		io.WriteString(resp, "Error not an action\n")
		log.Printf("Request received on /users that was not POST")
		return
	}
	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&post)
	if err != nil {
		resp.WriteHeader(http.StatusBadRequest)
		io.WriteString(resp, fmt.Sprintf("Error could not decode posted data: %v\n", err))
		log.Printf("Posted data on /users could not be decoded: %v", err)
		return
	}
	if post.UserName == "" {
		resp.WriteHeader(http.StatusBadRequest)
		io.WriteString(resp, "Username is blank\n")
		log.Printf("Posted data on /users, username is blank.")
		return
	}
	if post.Password == "" {
		resp.WriteHeader(http.StatusBadRequest)
		io.WriteString(resp, "Password is blank\n")
		log.Printf("Posted data on /users, password is blank.")
		return
	}
	err = handler.register(post.UserName, post.Password)
	if err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
		io.WriteString(resp, fmt.Sprintf("Error could not register user: %v\n", err))
		log.Printf("New user could not be registered: %v", err)
		return
	}
}

func (server *Server) ListenAndServe() error {

	http.Handle("/users", server.user)

	log.Printf("Listening on %v for rest", server.port)
	serve := fmt.Sprintf(":%v", server.port)
	err := http.ListenAndServe(serve, nil)
	if err != nil {
		return err
	}
	return nil
}
