// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract VerifySignature {

    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    function getPermitMessageHash( address _owner,
        address _spender, uint256 _amount,  uint256 _period
    )
        public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(PERMIT_TYPEHASH, _owner, _spender, _amount, _period ));
    }

    function getMessageHash(
        address _to, uint _amount, string memory _message, uint _nonce
    )
        public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(_to, _amount, _message, _nonce));
    }


    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {

        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function verify(
        address _signer,
        address _to, uint256 _amount, string memory _message, uint _nonce,
        bytes memory signature
    )
        public pure returns (bool)
    {
        bytes32 messageHash = getMessageHash(_to, _amount, _message, _nonce);

        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function recoverSigner2(bytes32 _ethSignedMessageHash, uint8 v, bytes32 r, bytes32 s)
        public pure returns (address)
    {
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }


    function splitSignature(bytes memory sig)
        public pure returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}