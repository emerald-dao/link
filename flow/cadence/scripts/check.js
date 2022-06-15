export const checkScript = `
import FLOAT from 0x2d4c3caffbeab845
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import Art from 0xd796ff17107bbff6

pub fun main(user: Address): [String] {
  let account = getAccount(user)
  let bad: [String] = []
  if account.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>(FLOAT.FLOATCollectionPublicPath).check() && !account.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath).check() {
    bad.append("FLOAT")
  }
  if account.getCapability<&{Art.CollectionPublic}>(Art.CollectionPublicPath).check() && !account.getCapability<&Art.Collection{Art.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Art.CollectionPublicPath).check() {
    bad.append("Versus")
  }


  return bad
}
`