#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=$SCRIPT_DIR"/../"
CONTRACTS_DIR=$ROOT_DIR"uniswap-v2-periphery/"

cd $CONTRACTS_DIR

git submodule init
git submodule update

npm install
truffle compile

cp $CONTRACTS_DIR"build"/* $ROOT_DIR"build/contracts/"

cd -
