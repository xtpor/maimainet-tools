
import assert from "assert"

import Fetcher from "./fetcher.js"
import * as ops from "./operations.js"
import { InvalidSessionError, TemporaryError } from "./errors.js"


const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0"

export const FriendFilter = {
  CURRENT: "CURRENT",
  INVITING: "INVITING",
  ACCEPTING: "ACCEPTING",
}

export class Session {

  constructor() {
    this.fetcher = new Fetcher({ userAgent: UA })
    this.isActive = false
  }

  save() {
    return JSON.stringify(this.fetcher.cookies)
  }

  restore(state) {
    this.fetcher.cookies = JSON.parse(state)
    this.isActive = true
  }

  async _autoReauthenticate(fn) {
    try {
      return await fn()
    } catch (e) {
      if (e instanceof TemporaryError) {
        const result = await ops.reauthenticate(this.fetcher)
        if (result) {
          return this._autoReauthenticate(fn)
        } else {
          this.isActive = false
          throw new InvalidSessionError("reauthentication attempt failed")
        }
      } else {
        throw e
      }
    }
  }

  async login({ sid, password }) {
    const result = await ops.login(this.fetcher, String(sid), String(password))
    this.isActive = result
    return result
  }

  async myProfile() {
    if (!this.isActive) throw new InvalidSessionError("unauthenticated")
    const profile = await this._autoReauthenticate(() => ops.getProfile(this.fetcher))
    assert(profile !== null, "profile should not be null")

    const friendCode = await this._autoReauthenticate(() => ops.getMyFriendCode(this.fetcher))
    assert(friendCode !== null, "friend code should not be null")

    return { ...profile, friendCode }
  }

  async friends(filter = FriendFilter.CURRENT) {
    if (filter === FriendFilter.CURRENT) {
      return this.friendsCurrent()
    } else if (filter === FriendFilter.INVITING) {
      return this.friendsInviting()
    } else if (filter === FriendFilter.ACCEPTING) {
      return this.friendsAccepting()
    } else {
      throw new Error("invalid filter " + filter)
    }
  }

  async friendsCurrent() {
    if (!this.isActive) throw new InvalidSessionError("unauthenticated")

    // get the complete friend list, page by page
    const pageOne = await this._autoReauthenticate(() => ops.getPaginatedFriendList(this.fetcher, 1))
    assert(pageOne !== null, "page should not be null")

    if (pageOne.friendCount <= 10) {
      return pageOne.friends
    } else {
      const result = [pageOne.friends]
      const restPageCount = Math.ceil((pageOne.friendCount / 10)) - 1

      for (let i = 0; i < restPageCount; i += 1) {
        const page = await this._autoReauthenticate(() => ops.getPaginatedFriendList(this.fetcher, i + 2))
        assert(page !== null, "page should not be null")
        result.push(page.friends)
      }

      return result.flat()
    }
  }

  async friendsInviting() {
    const list = await this._autoReauthenticate(() =>
      ops.getInviteEntries(this.fetcher)
    )
    assert(list !== null, "friends inviting should not be null")

    return list
  }

  async friendsAccepting() {
    const list = await this._autoReauthenticate(() =>
      ops.getAcceptEntries(this.fetcher)
    )
    assert(list !== null, "friends accepting should not be null")

    return list
  }

  async search(friendCode) {
    if (!this.isActive) throw new InvalidSessionError("unauthenticated")

    const result = await this._autoReauthenticate(() => ops.getSearchResult(this.fetcher, friendCode))
    // no need to do assert because search can be failed (if user is not found)
    return result
  }

  async friendPlayData(friendCode) {
    if (!this.isActive) throw new InvalidSessionError("unauthenticated")

    const difficulties = [0, 1, 2, 3, 4]
    const result = []
    for (const d of difficulties) {
      const r = await this._autoReauthenticate(() => ops.getFriendVersus(this.fetcher, friendCode, d))
      assert(r !== null, "friend play data should not be null")

      for (const record of r) {
        result.push({
          song: record.song,
          achievement: record.rightAchievement,
          badge1: record.rightBadge1,
          badge2: record.rightBadge2,
          level: record.level,
          difficulty: record.difficulty,
          kind: record.kind,
        })
      }
    }

    return result
  }

  async favorite(friendCode, flag) {
    const op = flag ? ops.doSetFavoriteOn : ops.doSetFavoriteOff
    await this._autoReauthenticate(() => op(this.fetcher, friendCode))
  }

  async invite(friendCode) {
    await this._autoReauthenticate(() => ops.doInviteFriend(this.fetcher, friendCode))
  }

  async accept(friendCode) {
    await this._autoReauthenticate(() => ops.doAcceptInvitation(this.fetcher, friendCode))
  }

  async reject(friendCode) {
    await this._autoReauthenticate(() => ops.doRejectInvitation(this.fetcher, friendCode))
  }

}
