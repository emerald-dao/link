export const linkTx = `
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import FLOAT from 0x2d4c3caffbeab845
import Art from 0xd796ff17107bbff6
import GoatedGoats from 0x2068315349bdfce5
import Flovatar from 0x921ea449dffec68a
import FlovatarComponent from 0x921ea449dffec68a

transaction() {
  prepare(signer: AuthAccount) {
    if signer.borrow<&NonFungibleToken.Collection>(from:FLOAT.FLOATCollectionStoragePath) != nil && !signer.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath).check() {
      signer.unlink(FLOAT.FLOATCollectionPublicPath)
      signer.link<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath, target: FLOAT.FLOATCollectionStoragePath)
    }

    if signer.borrow<&NonFungibleToken.Collection>(from: Art.CollectionStoragePath) != nil && !signer.getCapability<&Art.Collection{Art.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Art.CollectionPublicPath).check() {
      signer.unlink(Art.CollectionPublicPath)
      signer.link<&Art.Collection{Art.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Art.CollectionPublicPath, target: Art.CollectionStoragePath)
    }

    if signer.borrow<&NonFungibleToken.Collection>(from:GoatedGoats.CollectionStoragePath) != nil  && !signer.getCapability<&GoatedGoats.Collection{GoatedGoats.GoatCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(GoatedGoats.CollectionPublicPath).check() {
        signer.unlink(GoatedGoats.CollectionPublicPath)
        signer.link<&GoatedGoats.Collection{GoatedGoats.GoatCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(GoatedGoats.CollectionPublicPath, target: GoatedGoats.CollectionStoragePath)
    }

    if signer.borrow<&NonFungibleToken.Collection>(from:Flovatar.CollectionStoragePath) != nil && !signer.getCapability<&Flovatar.Collection{Flovatar.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Flovatar.CollectionPublicPath).check() {
        signer.unlink(Flovatar.CollectionPublicPath)
        signer.link<&Flovatar.Collection{Flovatar.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Flovatar.CollectionPublicPath, target: Flovatar.CollectionStoragePath)
    }

    if signer.borrow<&NonFungibleToken.Collection>(from:FlovatarComponent.CollectionStoragePath) != nil && !signer.getCapability<&FlovatarComponent.Collection{FlovatarComponent.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FlovatarComponent.CollectionPublicPath).check() {
        signer.unlink(FlovatarComponent.CollectionPublicPath)
        signer.link<&FlovatarComponent.Collection{FlovatarComponent.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FlovatarComponent.CollectionPublicPath, target: FlovatarComponent.CollectionStoragePath)
    }
  }
}
`
