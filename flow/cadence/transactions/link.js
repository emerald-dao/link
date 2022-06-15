export const linkTx = `
import FLOAT from 0x2d4c3caffbeab845
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import Art from 0xd796ff17107bbff6

transaction() {
  prepare(signer: AuthAccount) {
    if signer.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>(FLOAT.FLOATCollectionPublicPath).check() && !signer.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath).check() {
      signer.unlink(FLOAT.FLOATCollectionPublicPath)
      signer.link<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath, target: FLOAT.FLOATCollectionStoragePath)
    }

    if signer.getCapability<&{Art.CollectionPublic}>(Art.CollectionPublicPath).check() && !signer.getCapability<&Art.Collection{Art.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Art.CollectionPublicPath).check() {
      signer.unlink(Art.CollectionPublicPath)
      signer.link<&Art.Collection{Art.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(Art.CollectionPublicPath, target: Art.CollectionStoragePath)
    }
  }
}
`