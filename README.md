
# maimainet-tools

`maimainet-tools` is a javascript SDK for interacting with game statistics website for the famous arcade game Maimai DX.

## Installation

```
npm install xtpor/maimainet-tools
```

## Basic Usage

Import the library either using CommonJS `require` or ES6 module `import`

```js
const { Session, FriendFilter } = require("maimainet-tools")
// or
import { Session, FriendFilter } from "maimainet-tools"
```

To interact with maimai net, first you have to create a session, then call the `login()` method with the Sega ID and the password of the maimai net account.

```js
const session = new Session()
const result = await session.login({
  sid: "input the sega id here",
  password: "input the password here",
})

if (result) {
  // logged in successfully
}
```

Once you're logged in, you can called the `profile()`

```js
const profileData = await session.myProfile()
console.log(profileData)
```

## API Documentation

Create a new session

```js
const session = new Session()
```

Login to sega account

```js
const sid = "your sega id"
const password = "your password"
const result = await session.login({ sid, password })
```

Get my profile (name, rating, and friend code)

```js
const data = await session.myProfile()
```

Get the list of my friends

```js
const data = await session.friends()
```

Get the list of invitations sent to others by me

```js
const data = await session.friends(FriendFilter.INVITING)
```

Get the list of invitations sent to me by others

```js
const data = await session.friends(FriendFilter.ACCEPTING)
```

Get the play data of a friend (must a favorite)

```js
const data = await session.friendPlayData(friendCode)
```

Set/unset a friend as favorite

```js
// set as favorite
const data = await session.favorite(friendCode, true)

// unset as favorite
const data = await session.favorite(friendCode, false)
```

Send a friend request

```js
const data = await session.invite(friendCode)
```

Accept a friend request

```js
const data = await session.accept(friendCode)
```

Reject a friend request

```js
const data = await session.reject(friendCode)
```

Save the session and restore it later

```js
const session = new Session()

// login to the session
session.login({ sid, password })

// save the session
const saved = session.save()
// please store the saved session by some means maybe in a file or a database

// after a app restart
// now the new session is identical to the old one
const session = new Session()
session.restore(saved)
```
