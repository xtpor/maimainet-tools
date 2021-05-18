const fs = require("fs")

const { Session, FriendFilter } = require("..")

const SESSION_STORAGE = "/tmp/maimainet-test.state"

function storeContext(session) {
  const state = session.save()
  fs.writeFileSync(SESSION_STORAGE, state, "utf8")
}

async function main() {
  const session = new Session()

  console.log(await session.login({
    sid: "",
    password: "",
  }))

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
