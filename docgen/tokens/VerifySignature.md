

# Functions:
- [`getPermitMessageHash(address _owner, address _spender, uint256 _amount, uint256 _nonce, uint256 _period)`](#VerifySignature-getPermitMessageHash-address-address-uint256-uint256-uint256-)
- [`getMessageHash(address _to, uint256 _amount, string _message, uint256 _nonce)`](#VerifySignature-getMessageHash-address-uint256-string-uint256-)
- [`getEthSignedMessageHash(bytes32 _messageHash)`](#VerifySignature-getEthSignedMessageHash-bytes32-)
- [`verify(address _signer, address _to, uint256 _amount, string _message, uint256 _nonce, bytes signature)`](#VerifySignature-verify-address-address-uint256-string-uint256-bytes-)
- [`recoverSigner(bytes32 _ethSignedMessageHash, bytes _signature)`](#VerifySignature-recoverSigner-bytes32-bytes-)
- [`recoverSigner2(bytes32 _ethSignedMessageHash, uint8 v, bytes32 r, bytes32 s)`](#VerifySignature-recoverSigner2-bytes32-uint8-bytes32-bytes32-)
- [`splitSignature(bytes sig)`](#VerifySignature-splitSignature-bytes-)


# Function `getPermitMessageHash(address _owner, address _spender, uint256 _amount, uint256 _nonce, uint256 _period) → bytes32` {#VerifySignature-getPermitMessageHash-address-address-uint256-uint256-uint256-}
No description
# Function `getMessageHash(address _to, uint256 _amount, string _message, uint256 _nonce) → bytes32` {#VerifySignature-getMessageHash-address-uint256-string-uint256-}
No description
# Function `getEthSignedMessageHash(bytes32 _messageHash) → bytes32` {#VerifySignature-getEthSignedMessageHash-bytes32-}
No description
# Function `verify(address _signer, address _to, uint256 _amount, string _message, uint256 _nonce, bytes signature) → bool` {#VerifySignature-verify-address-address-uint256-string-uint256-bytes-}
No description
# Function `recoverSigner(bytes32 _ethSignedMessageHash, bytes _signature) → address` {#VerifySignature-recoverSigner-bytes32-bytes-}
No description
# Function `recoverSigner2(bytes32 _ethSignedMessageHash, uint8 v, bytes32 r, bytes32 s) → address` {#VerifySignature-recoverSigner2-bytes32-uint8-bytes32-bytes32-}
No description
# Function `splitSignature(bytes sig) → bytes32 r, bytes32 s, uint8 v` {#VerifySignature-splitSignature-bytes-}
No description

