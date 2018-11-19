import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

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
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ itemID: id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(addToCart, { loading }) => (
          <button onClick={addToCart} disabled={loading}>
            Add
            {loading && "ing"} to Cart 🛒
          </button>
        )}
      </Mutation>
    );
  }
}

export default AddToCart;
export { ADD_TO_CART_MUTATION };
