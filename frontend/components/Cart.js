import React, { Component } from "react";
import CartStyles from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";

const Cart = () => {
  return (
    <CartStyles open>
      <header>
        <CloseButton title="close">&times;</CloseButton>
        <Supreme>Your Cart</Supreme>
        <p>You have x items in your cart.</p>
      </header>
      <footer>
        <p>$xx.xx</p>
        <SickButton>Checkout</SickButton>
      </footer>
    </CartStyles>
  );
};

export default Cart;
