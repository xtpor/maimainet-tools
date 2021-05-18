
import assert from "assert"

import { URL } from "url"
import nodeHtmlParser from "node-html-parser"
const { parse } = nodeHtmlParser


function parseUserBlock(dom) {
  const nameBlock = dom.querySelector(".name_block")
  const img = dom.querySelector(".basic_block img")
  const ratingBlock = dom.querySelector(".basic_block .rating_block")

  const entry = {
    playerName: nameBlock.text,
    avatar: img.getAttribute("src"),
    rating: Number(ratingBlock.text),
  }

  const code = extractFriendCode(dom)
  if (code) {
    return { ...entry, friendCode: code }
  } else {
    return entry
  }
}

function extractFriendCode(dom) {
  const block = dom.querySelector("input[type=hidden][name=idx]")
  if (block) {
    return block.getAttribute("value")
  } else {
    return null
  }
}


export function parseHomePage(html) {
  const dom = parse(html)

  return parseUserBlock(dom)
}

export function parseFriendPage(html) {
  const dom = parse(html)

  const block0 = dom.querySelector(".basic_block.m_3.p_3.f_11")
  const friendCountMatchResult = block0.text.trim().match(/^FRIENDS(.+)\/100$/)
  const friendCount = Number(friendCountMatchResult[1])

  const block1 = dom.querySelector("td:nth-child(2) .basic_block.m_3.p_3.f_11")
  const favoriteCountMatchResult = block1.text.trim().match(/^FAVORITE FRIENDS(.+)\/20$/)
  const favoriteCount = Number(favoriteCountMatchResult[1])

  const entries = []
  const friendBlocks = dom.querySelectorAll(".see_through_block")
  for (const elem of friendBlocks) {
    const idBlock = elem.querySelector("form input")
    const nameBlock = elem.querySelector(".name_block")
    const ratingBlock = elem.querySelector(".basic_block .rating_block")
    const favoriteIcon = elem.querySelector(".friend_favorite_icon")

    entries.push({
      friendCode: idBlock.getAttribute("value"),
      name: nameBlock.text,
      rating: Number(ratingBlock.text),
      isFavorite: Boolean(favoriteIcon),
    })
  }

  return { friends: entries, friendCount, favoriteCount }
}

export function parseAchievement(text) {
  if (text.endsWith("%")) {
    text = text.slice(0, -1)
  }
  text = text.replace("%", "")
  text = text.replace(".", "")
  return Number(text)
}

function parseBadges(dom, idx1, idx2) {
  function mapUrlToBadge(url) {
    if (url === "https://maimaidx-eng.com/maimai-mobile/img/music_icon_s.png?ver=1.10") assert(false)
    const symbol = url.match(/music_icon_([a-z]+)/)[1]
    const transformed = {
      fc: "fullCombo",
      fcp: "fullComboPlus",
      ap: "allPerfect",
      app: "allPerfectPlus",
      fs: "fullSync",
      fsp: "fullSyncPlus",
      fsd: "fullSyncDeluxe",
      fsdp: "fullSyncDeluxePlus",
    }[symbol] || null
    return transformed
  }


  const img1 = dom.querySelector(`img.h_30:nth-child(${idx1})`)
  const img2 = dom.querySelector(`img.h_30:nth-child(${idx2})`)
  assert(img1 !== null)
  assert(img2 !== null)
  return [mapUrlToBadge(img1.getAttribute("src")),
    mapUrlToBadge(img2.getAttribute("src"))]
}

export function parseVersusPage(html, difficulty) {
  const dom = parse(html)
  const entries = []

  for (const elem of dom.querySelectorAll(".w_450.m_15")) {
    const row1 = elem.querySelector("tr:nth-child(1)")
    const row2 = elem.querySelector("tr:nth-child(2)")
    assert(row1 !== null)
    assert(row2 !== null)

    const song = elem.querySelector(".music_name_block").text.trim()
    const icon = elem.querySelector(".music_kind_icon")
    const kind = icon.getAttribute("src").includes("standard") ? "standard" : "dx"
    const level = elem.querySelector(".music_lv_block").text.trim()

    const leftAchievement = parseAchievement(row1.querySelector("td:first-child").text.trim())
    const rightAchievement = parseAchievement(row1.querySelector("td:last-child").text.trim())

    const [leftBadge1, leftBadge2] = parseBadges(row2.querySelector("td:first-child"), 2, 3)
    const [rightBadge1, rightBadge2] = parseBadges(row2.querySelector("td:last-child"), 2, 1)

    entries.push({
      song,
      leftAchievement,
      rightAchievement,
      leftBadge1,
      leftBadge2,
      rightBadge1,
      rightBadge2,
      level,
      difficulty,
      kind,
    })
  }

  return entries
}

export function parseFriendCodePage(html) {
  const dom = parse(html)
  const elem = dom.querySelector(".see_through_block .see_through_block")
  return elem.text.trim()
}

export function parseSearchFriendPage(html) {
  const dom = parse(html)
  const block = dom.querySelector(".see_through_block")

  if (block) {
    if (block.text.includes("WRONG CODE")) {
      return null
    } else {
      return parseUserBlock(block)
    }
  } else {
    return null
  }
}

export function parseInviteEntriesPage(html) {
  const dom = parse(html)
  const result = []

  for (const elem of dom.querySelectorAll(".see_through_block.m_15.p_10.t_l.f_0")) {
    result.push(parseUserBlock(elem))
  }

  return result
}

export function parseAcceptEntriesPage(html) {
  const dom = parse(html)
  const result = []

  for (const elem of dom.querySelectorAll(".see_through_block.m_15.p_10.t_l.f_0")) {
    result.push(parseUserBlock(elem))
  }

  return result
}
