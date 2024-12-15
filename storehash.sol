//  SPDX-License-Identifier: UNLICENSED
pragma solidity >0.5.0;
 contract storehash
 {
      string hash; 
    function set_test(string memory data) public   {
         hash=data;
    }
       function get() public view returns (string memory) {
      return hash;
       }
 }