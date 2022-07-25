export const checkScript = `
import FLOAT from 0x2d4c3caffbeab845
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import Art from 0xd796ff17107bbff6
import GoatedGoats from 0x2068315349bdfce5

pub fun main(user: Address): [String] {
  let account = getAuthAccount(user)
  let bad: [String] = []
	if account.borrow<&Any>
  if account.borrow<&NonFungibleToken.Collection>(from:FLOAT.FLOATCollectionStoragePath) && !account.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath).check() {
    bad.append("FLOAT")
  }
  if account.borrow<&NonFungibleToken.Collection>(from:Art.CollectionStoragePath) != nil && !account.getCapability<&Art.Collection{Art.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Art.CollectionPublicPath).check() {
    bad.append("Versus")
  }

	if account.borrow<&NonFungibleToken.Collection>(from:GoatedGoats.CollectionStoragePath) != nil && !account.getCapability<&GoatedGoats.Collection{GoatedGoats.GoatCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(/public/GoatCollection).check() {
    bad.append("Goats")
  } 

  return bad
}
`
