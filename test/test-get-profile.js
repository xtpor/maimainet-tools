const fs = require("fs")

const { Session, FriendFilter } = require("..")

const SESSION_STORAGE = "/tmp/maimainet-test.state"

function loadContext(session) {
  try {
    const state = fs.readFileSync(SESSION_STORAGE, "utf8")
    session.restore(state)
  } catch (e) {
    if (e.code === "ENOENT") {
      return
    } else {
      console.error(e)
    }
  }
}

function storeContext(session) {
  const state = session.save()
  fs.writeFileSync(SESSION_STORAGE, state, "utf8")
}

async function main() {
  const session = new Session()
  loadContext(session)

  console.log(await session.myProfile())

  storeContext(session)
}

async function start() {
  try {
    await main()
  } catch (e) {
    console.error(e)
  }
}

start()
