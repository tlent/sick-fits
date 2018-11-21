import { mount } from "enzyme";
import wait from "waait";
import RemoveFromCart, {
  REMOVE_FROM_CART_MUTATION
} from "../components/RemoveFromCart";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import { ApolloConsumer } from "react-apollo";

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [{ ...fakeCartItem(), id: "abc123" }, fakeCartItem()]
        }
      }
    }
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: "abc123" } },
    result: {
      data: {
        removeFromCart: {
          __typename: "CartItem",
          id: "abc123"
        }
      }
    }
  }
];

describe("RemoveFromCart component", () => {
  it("renders and matches snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <RemoveFromCart id={"abc123"} />
      </MockedProvider>
    );
    expect(wrapper.find("button")).toMatchSnapshot();
  });

  it("removes item from cart on click", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <RemoveFromCart id={"abc123"} />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    let cart = (await apolloClient.query({ query: CURRENT_USER_QUERY })).data.me
      .cart;
    expect(cart).toHaveLength(2);

    wrapper.find("button").simulate("click");
    await wait();
    wrapper.update();
    cart = (await apolloClient.query({ query: CURRENT_USER_QUERY })).data.me
      .cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe("omg123");
  });
});
