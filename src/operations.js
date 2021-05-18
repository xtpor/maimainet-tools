
import { parseHomePage, parseFriendPage, parseFriendCodePage, parseVersusPage,
  parseSearchFriendPage, parseInviteEntriesPage, parseAcceptEntriesPage } from "./parsers.js"

import { TemporaryError } from "./errors.js"

const FORM_LOGIN = "https://lng-tgk-aime-gw.am-all.net/common_auth/login/sid/"
const PAGE_LOGIN  = "https://lng-tgk-aime-gw.am-all.net/common_auth/login?site_id=maimaidxex&redirect_url=https://maimaidx-eng.com/maimai-mobile/&back_url=https://maimai.sega.com/"
const PAGE_ROOT = "https://maimaidx-eng.com/maimai-mobile/"
const PAGE_HOME  = "https://maimaidx-eng.com/maimai-mobile/home/"
const PAGE_FRIEND_CODE = "https://maimaidx-eng.com/maimai-mobile/friend/userFriendCode/"
const PAGE_FRIENDS_PAGE = "https://maimaidx-eng.com/maimai-mobile/friend/"
const PAGE_ACCEPT_ENTRIES_PAGE = "https://maimaidx-eng.com/maimai-mobile/friend/accept/"
const PAGE_ACCEPT_ENTRIES_PAGE_ALT = "https://maimaidx-eng.com/maimai-mobile/index.php/friend/accept/"
const PAGE_INVITE_ENTRIES_PAGE = "https://maimaidx-eng.com/maimai-mobile/friend/invite/"
const PAGE_INVITE_ENTRIES_PAGE_ALT = "https://maimaidx-eng.com/maimai-mobile/index.php/friend/invite/"
const PAGE_ERROR = "https://maimaidx-eng.com/maimai-mobile/error/"

const FORM_FAVORITE_ON = "https://maimaidx-eng.com/maimai-mobile/friend/favoriteOn/"
const FORM_FAVORITE_OFF = "https://maimaidx-eng.com/maimai-mobile/friend/favoriteOff/"
const FORM_INVITE = "https://maimaidx-eng.com/maimai-mobile/friend/search/invite"
const FORM_ACCEPT = "https://maimaidx-eng.com/maimai-mobile/friend/accept/allow"
const FORM_REJECT = "https://maimaidx-eng.com/maimai-mobile/friend/accept/block"

function D_PAGE_FRIEND_VERSUS(id, diff) {
  return `https://maimaidx-eng.com/maimai-mobile/friend/friendGenreVs/battleStart/?scoreType=2&genre=99&diff=${diff}&idx=${id}`
}

function D_PAGE_FRIENDS_PAGINATED(page = 1) {
  return `https://maimaidx-eng.com/maimai-mobile/friend/pages/?idx=${page}`
}

function D_PAGE_SEARCH(friendCode) {
  return `https://maimaidx-eng.com/maimai-mobile/friend/search/searchUser/?friendCode=${friendCode}`
}

export async function reauthenticate(fetcher) {
  const response = await fetcher.get(PAGE_ROOT)

  return response.ok && response.url === PAGE_HOME
}

export async function login(fetcher, sid, password) {
  await fetcher.get(PAGE_LOGIN)
  const response = await fetcher.post(FORM_LOGIN, {
    sid: sid,
    password: password,
    retention: "1"
  })

  return response.ok && response.url === PAGE_HOME
}

// queries

export async function getProfile(fetcher) {
  const url = PAGE_HOME
  const response = await fetcher.get(url)
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  if (response.ok && response.url === url) {
    return parseHomePage(await response.text())
  } else {
    return null
  }
}

export async function getPaginatedFriendList(fetcher, page = 1) {
  const url = D_PAGE_FRIENDS_PAGINATED(page)
  const response = await fetcher.get(url)
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  if (response.ok && response.url === url) {
    return parseFriendPage(await response.text())
  } else {
    return null
  }
}

export async function getMyFriendCode(fetcher) {
  const url = PAGE_FRIEND_CODE
  const response = await fetcher.get(url)
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  if (response.ok && response.url === url) {
    return parseFriendCodePage(await response.text())
  } else {
    return null
  }
}

export async function getFriendVersus(fetcher, friendCode, difficulty) {
  const url = D_PAGE_FRIEND_VERSUS(friendCode, difficulty)
  const response = await fetcher.get(url)
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  if (response.ok && response.url === url) {
    const text = await response.text()
    return parseVersusPage(text, difficulty)
  } else {
    return null
  }
}

export async function getSearchResult(fetcher, friendCode) {
  const url = D_PAGE_SEARCH(friendCode)
  const response = await fetcher.get(url)
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  if (response.ok && response.url === url) {
    const text = await response.text()
    return parseSearchFriendPage(text)
  } else {
    return null
  }
}

export async function getInviteEntries(fetcher) {
  const url = PAGE_INVITE_ENTRIES_PAGE
  const urlAlt = PAGE_INVITE_ENTRIES_PAGE_ALT

  const response = await fetcher.get(url)
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  if (response.ok && (response.url === url || response.url === urlAlt)) {
    const text = await response.text()
    return parseInviteEntriesPage(text)
  } else {
    return null
  }
}

export async function getAcceptEntries(fetcher) {
  const url = PAGE_ACCEPT_ENTRIES_PAGE
  const urlAlt = PAGE_ACCEPT_ENTRIES_PAGE_ALT

  const response = await fetcher.get(url)
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  if (response.ok && (response.url === url || response.url === urlAlt)) {
    const text = await response.text()
    return parseAcceptEntriesPage(text)
  } else {
    return null
  }
}

// actions

export async function doSetFavoriteOn(fetcher, friendCode) {
  const url = FORM_FAVORITE_ON
  const response = await fetcher.post(url, {
    idx: friendCode,
    token: fetcher.getCookie("https://maimaidx-eng.com", "_t"),
  })
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  return response.ok && response.url === url
}

export async function doSetFavoriteOff(fetcher, friendCode) {
  const url = FORM_FAVORITE_OFF
  const response = await fetcher.post(url, {
    idx: friendCode,
    token: fetcher.getCookie("https://maimaidx-eng.com", "_t"),
  })
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  return response.ok && response.url === url
}

export async function doInviteFriend(fetcher, friendCode) {
  const url = FORM_INVITE
  const response = await fetcher.post(url, {
    idx: friendCode,
    token: fetcher.getCookie("https://maimaidx-eng.com", "_t"),
  })
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  return response.ok && response.url === url
}

export async function doAcceptInvitation(fetcher, friendCode) {
  const url = FORM_ACCEPT
  const response = await fetcher.post(url, {
    idx: friendCode,
    token: fetcher.getCookie("https://maimaidx-eng.com", "_t"),
  })
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  return response.ok && response.url === url
}

export async function doRejectInvitation(fetcher, friendCode) {
  const url = FORM_REJECT
  const response = await fetcher.post(url, {
    idx: friendCode,
    token: fetcher.getCookie("https://maimaidx-eng.com", "_t"),
  })
  if (response.url === PAGE_ERROR) throw new TemporaryError()

  return response.ok && response.url === url
}
