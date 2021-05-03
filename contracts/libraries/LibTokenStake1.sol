//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibTokenStake1 {

    struct saleInfo {
        bool closed;
        uint256 startBlock;
    }

    struct stakeInfo {
        string name;
        uint256 startBlcok;
        uint256 endBlock;
        uint256 balance;
        uint256 totalRewardAmount;
        uint256 claimRewardAmount;
    }

    struct StakedAmount {
        uint256 amount;
        uint256 claimedBlock;
        uint256 claimedAmount;
        uint256 releasedBlock;
        uint256 releasedAmount;
        bool released;
    }
 /*

    function sort_array(uint256[] memory arr_) public pure returns (uint256[] memory )
    {
        uint256 l = arr_.length;
        uint256[] memory arr = new uint256[] (l);

        for(uint256 i=0;i<l;i++)
        {
            arr[i] = arr_[i];
        }

        for(uint256 i =0;i<l;i++)
        {
            for(uint256 j =i+1;j<l;j++)
            {
                if(arr[i]<arr[j])
                {
                    uint256 temp= arr[j];
                    arr[j]=arr[i];
                    arr[i] = temp;

                }

            }
        }

        return arr;
    }
    */
}
