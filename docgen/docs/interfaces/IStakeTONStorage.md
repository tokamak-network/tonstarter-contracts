# Functions:

- [`ton()`](#IStakeTONStorage-ton--)

- [`wton()`](#IStakeTONStorage-wton--)

- [`seigManager()`](#IStakeTONStorage-seigManager--)

- [`depositManager()`](#IStakeTONStorage-depositManager--)

- [`tokamakLayer2()`](#IStakeTONStorage-tokamakLayer2--)

- [`toTokamak()`](#IStakeTONStorage-toTokamak--)

- [`fromTokamak()`](#IStakeTONStorage-fromTokamak--)

- [`toUniswapWTON()`](#IStakeTONStorage-toUniswapWTON--)

- [`swappedAmountTOS()`](#IStakeTONStorage-swappedAmountTOS--)

- [`finalBalanceTON()`](#IStakeTONStorage-finalBalanceTON--)

- [`finalBalanceWTON()`](#IStakeTONStorage-finalBalanceWTON--)

- [`defiStatus()`](#IStakeTONStorage-defiStatus--)

- [`withdrawFlag()`](#IStakeTONStorage-withdrawFlag--)

###### IStakeTONStorage-ton--

## Function `ton()`

TON address

###### IStakeTONStorage-wton--

## Function `wton()`

WTON address

###### IStakeTONStorage-seigManager--

## Function `seigManager()`

SeigManager address

###### IStakeTONStorage-depositManager--

## Function `depositManager()`

DepositManager address

###### IStakeTONStorage-tokamakLayer2--

## Function `tokamakLayer2()`

the layer2 address in Tokamak

###### IStakeTONStorage-toTokamak--

## Function `toTokamak()`

the accumulated TON amount staked into tokamak , in wei unit

###### IStakeTONStorage-fromTokamak--

## Function `fromTokamak()`

the accumulated WTON amount unstaked from tokamak , in ray unit

###### IStakeTONStorage-toUniswapWTON--

## Function `toUniswapWTON()`

the accumulated WTON amount swapped using uniswap , in ray unit

###### IStakeTONStorage-swappedAmountTOS--

## Function `swappedAmountTOS()`

the TOS balance in this contract

###### IStakeTONStorage-finalBalanceTON--

## Function `finalBalanceTON()`

the TON balance in this contract when withdraw at first

###### IStakeTONStorage-finalBalanceWTON--

## Function `finalBalanceWTON()`

the WTON balance in this contract when withdraw at first

###### IStakeTONStorage-defiStatus--

## Function `defiStatus()`

defi status -> NONE, APPROVE,DEPOSITED,REQUESTWITHDRAW,REQUESTWITHDRAWALL,WITHDRAW,END

###### IStakeTONStorage-withdrawFlag--

## Function `withdrawFlag()`

the withdraw flag, when withdraw at first, set true
