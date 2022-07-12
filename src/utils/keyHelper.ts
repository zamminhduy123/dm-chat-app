import {
  KeyHelper,
  SignedPublicPreKeyType,
  SignalProtocolAddress,
  SessionBuilder,
  PreKeyType,
  SessionCipher,
  MessageType,
} from "@privacyresearch/libsignal-protocol-typescript";

function generateIdentity(store: any) {
  return Promise.all([
    KeyHelper.generateIdentityKeyPair(),
    KeyHelper.generateRegistrationId(),
  ]).then(function (result) {
    store.put("identityKey", result[0]);
    store.put("registrationId", result[1]);
  });
}
