// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Retail {
    struct Product {
        string name;// name of product
        uint256 price; // pricenof product 
        uint256 stock; // 
    }
    mapping (string => Product ) public products; // keep track of product 
    address payable owner ;

    constructor () {
        owner = payable(msg.sender);
    }
    function addProduct(string memory name, uint256 price, uint256 stock ) public {
        require(msg.sender == owner , "only owner will add priduct.");
        products[name] = Product(name,price,stock);
    }

    function updateproductPrice (string memory name , uint256 price) public {
        require (msg.sender == owner , "only owner can update prices.");
        require(products[name].price > 0,"product should be exist");
        products[name].price =price ;
    }

    function updateProductStock(string memory name, uint256 stock) public {
        require (msg.sender == owner , "only owner can update");
        require(products[name].stock > 0,"product should be exist");
        products[name].stock = stock ;
    }

    function purchase (string memory name ,uint256 quantity) public payable {
        require (msg.value == products[name].price * quantity , "incorrect amt");
        require(quantity <= products[name].stock, "not enough stock");
        products[name].stock-= quantity;
    }
    function getProduct(string memory name) public view returns (string memory, uint256,uint256){
        return(products[name].name ,products[name].price , products[name].stock);
    }
    function grantAccess (address payable user) public {
        require (msg.sender == owner , "only owner can access");
        owner =user;
    }
    function revokeAccess (address payable user)  public{
        require(msg.sender == owner , "only owner revoke ");
        require(user != owner ,"cannot revoke acess for current owner");
        owner = payable(msg.sender);
    }
    
     
    
}