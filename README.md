
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
const result = session.login({
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
