import {
  KeyHelper,
  SignedPublicPreKeyType,
  SignalProtocolAddress,
  SessionBuilder,
  PreKeyType,
  SessionCipher,
  MessageType,
} from "@privacyresearch/libsignal-protocol-typescript";

const storeSomewhereSafe = () => {};

// const createID = async (name: string, store: SignalProtocolStore) => {
//   const registrationId = KeyHelper.generateRegistrationId();
//   // Store registrationId somewhere durable and safe... Or do this.
//   storeSomewhereSafe(store)(`registrationID`, registrationId);

//   const identityKeyPair = await KeyHelper.generateIdentityKeyPair();
//   // Store identityKeyPair somewhere durable and safe... Or do this.
//   storeSomewhereSafe(store)("identityKey", identityKeyPair);

//   const baseKeyId = Math.floor(10000 * Math.random());
//   const preKey = await KeyHelper.generatePreKey(baseKeyId);
//   store.storePreKey(`${baseKeyId}`, preKey.keyPair);

//   const signedPreKeyId = Math.floor(10000 * Math.random());
//   const signedPreKey = await KeyHelper.generateSignedPreKey(
//     identityKeyPair,
//     signedPreKeyId
//   );
//   store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
//   const publicSignedPreKey: SignedPublicPreKeyType = {
//     keyId: signedPreKeyId,
//     publicKey: signedPreKey.keyPair.pubKey,
//     signature: signedPreKey.signature,
//   };

//   // Now we register this with the server so all users can see them
//   const publicPreKey: PreKeyType = {
//     keyId: preKey.keyId,
//     publicKey: preKey.keyPair.pubKey,
//   };

//   return {
//     registrationId,
//     identityPubKey: identityKeyPair.pubKey,
//     signedPreKey: publicSignedPreKey,
//     oneTimePreKeys: [publicPreKey],
//   }
// };
