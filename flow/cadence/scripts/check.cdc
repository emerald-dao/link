import FLOAT from 0x2d4c3caffbeab845
import NonFungibleToken from 0x1d7e57aa55817448

pub fun main(user: Address): [String] {
  let account = getAccount(user)
  let bad: [String] = []
  if !account.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>(FLOAT.FLOATCollectionPublicPath).check() {
    bad.append("FLOAT")
  }

  return bad
}