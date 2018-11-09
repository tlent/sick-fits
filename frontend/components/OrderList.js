import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import styled from "styled-components";
import formatMoney from "../lib/formatMoney";
import OrderItemStyles from "./styles/OrderItemStyles";
import ErrorMessage from "../components/ErrorMessage";
import { formatDistance } from "date-fns/esm";

const USER_ORDERS_QUERY = gql`
  query USER_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        price
        description
        image
        quantity
      }
    }
  }
`;

const OrderUL = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

class OrderList extends Component {
  render() {
    return (
      <Query query={USER_ORDERS_QUERY}>
        {({ data: { orders }, error, loading }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <ErrorMessage error={error} />;
          return (
            <div>
              <h2>You have {orders.length} orders</h2>
              <OrderUL>
                {orders.map(order => (
                  <OrderItemStyles key={order.id}>
                    <Link
                      href={{ pathname: "/order", query: { id: order.id } }}
                    >
                      <a>
                        <div className="order-meta">
                          <p>
                            {order.items.reduce(
                              (total, order) => total + order.quantity,
                              0
                            )}{" "}
                            Items
                          </p>
                          <p>{order.items.length} Products</p>
                          <p>
                            {formatDistance(order.createdAt, new Date())} ago
                          </p>
                          <p>{formatMoney(order.total)}</p>
                        </div>
                        <div className="images">
                          {order.items.map(item => (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.title}
                            />
                          ))}
                        </div>
                      </a>
                    </Link>
                  </OrderItemStyles>
                ))}
              </OrderUL>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default OrderList;
