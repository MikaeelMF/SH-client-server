const { timeout } = require("nodemon/lib/config")
const {io} = require("socket.io-client")
const prompt = require("prompt-sync")({sigint:true})

// initaitig socket with given address and port
const address = "localhost"
const port = "1908"
const socket = io(`ws://${address}:${port}`)

var name
var delay_ms = 1000 // in millisecond
socket.on("connet", (arg) =>{
    while (socket.connected !== true) { // tries to reconnect in case of failure every $delay_ms milliseconds
        console.log("Could not connect to server! Retrying...")
        setTimeout(socket.connect(), delay_ms)
        delay_ms += 1000
        if (delay_ms > 10000){
            delay_ms = 10000
        }
    }
    console.log("Connected to the server!")
    name = prompt("Please enter your name: ")
    socket.emit("registeration", name)
})

// announces if ready or not, and uses callback to answer the server
socket.on("askReady", (callback)=>{
    ans = prompt("Are you ready to start the game?")
    callback(ans == "yes")
})

// shows the player role in the game
var role
var party
socket.on("ruleSet", (setRole, setParty)=>{
    role = setRole
    party = setParty
    console.log(`Your rule is: ${role} and your party is: ${party}`)  
})

socket.on("end", (result, winner)=>{
    console.log(`The result is: ${result}`)
    if (winner == party){
        console.log(`You won!`)
    } else {
        console.log("You Lost...")
    }
})

socket.on("replay", (callback)=>{
    var ans = prompt("Do you wish to replay? ")
    callback(ans==="yes")
    if (ans !=="yes"){
        socket.disconnect()
    }
})