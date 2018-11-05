import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($itemID: ID!) {
    addToCart(itemID: $itemID) {
      id
      quantity
    }
  }
`;

class AddToCart extends Component {
  render() {
    const { id } = this.props;
    return (
      <Mutation mutation={ADD_TO_CART_MUTATION} variables={{ itemID: id }}>
        {addToCart => <button onClick={addToCart}>Add to Cart 🛒</button>}
      </Mutation>
    );
  }
}

export default AddToCart;
