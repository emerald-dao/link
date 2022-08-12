export const checkScript = `
import FLOAT from 0x2d4c3caffbeab845
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import Art from 0xd796ff17107bbff6
import GoatedGoats from 0x2068315349bdfce5
import Flovatar from 0x921ea449dffec68a
import FlovatarComponent from 0x921ea449dffec68a
import HaikuNFT from 0xf61e40c19db2a9e2
import SoulMadeComponent from 0x9a57dfe5c8ce609c
import SoulMadeMain from 0x9a57dfe5c8ce609c
import SoulMadePack from 0x9a57dfe5c8ce609c

pub fun main(user: Address): [String] {
  let account = getAuthAccount(user)
  let bad: [String] = []
  if account.borrow<&NonFungibleToken.Collection>(from:FLOAT.FLOATCollectionStoragePath) != nil && !account.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath).check() {
    bad.append("FLOAT")
  }

  if account.borrow<&NonFungibleToken.Collection>(from:Art.CollectionStoragePath) != nil && !account.getCapability<&Art.Collection{Art.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Art.CollectionPublicPath).check() {
    bad.append("Versus")
  }

  if account.borrow<&NonFungibleToken.Collection>(from:GoatedGoats.CollectionStoragePath) != nil && !account.getCapability<&GoatedGoats.Collection{GoatedGoats.GoatCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(GoatedGoats.CollectionPublicPath).check() {
    bad.append("Goats")
  } 

  if account.borrow<&NonFungibleToken.Collection>(from:Flovatar.CollectionStoragePath) != nil && !account.getCapability<&Flovatar.Collection{Flovatar.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Flovatar.CollectionPublicPath).check() {
    bad.append("Flovatar")
  } 

  if account.borrow<&NonFungibleToken.Collection>(from:FlovatarComponent.CollectionStoragePath) != nil && !account.getCapability<&FlovatarComponent.Collection{FlovatarComponent.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FlovatarComponent.CollectionPublicPath).check() {
    bad.append("FlovatarComponent")
  }

  if account.borrow<&NonFungibleToken.Collection>(from:HaikuNFT.HaikuCollectionStoragePath) != nil && !account.getCapability<&HaikuNFT.Collection{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(HaikuNFT.HaikuCollectionPublicPath).check() {
    bad.append("Bitku")
  }

if account.borrow<&NonFungibleToken.Collection>(from:SoulMadeComponent.CollectionStoragePath) != nil && !account.getCapability<&SoulMadeComponent.Collection{SoulMadeComponent.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(SoulMadeComponent.CollectionPublicPath).check() {
    bad.append("SoulMadeComponent")
  }

if account.borrow<&NonFungibleToken.Collection>(from:SoulMadeMain.CollectionStoragePath) != nil && !account.getCapability<&SoulMadeMain.Collection{SoulMadeMain.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(SoulMadeMain.CollectionPublicPath).check() {
    bad.append("SoulMadeMain")
  }

if account.borrow<&SoulMadePack.Collection>(from:SoulMadePack.CollectionStoragePath) != nil && !account.getCapability<&SoulMadePack.Collection{SoulMadePack.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(SoulMadePack.CollectionPublicPath).check() {
    bad.append("SoulMadePack")
  }    

	return bad
}
`
