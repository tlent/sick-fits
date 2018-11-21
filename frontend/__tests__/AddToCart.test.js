import { mount } from "enzyme";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { ApolloConsumer } from "react-apollo";
import AddToCart, { ADD_TO_CART_MUTATION } from "../components/AddToCart";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import { CURRENT_USER_QUERY } from "../components/User";

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [] } } }
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } }
  },
  {
    request: { query: ADD_TO_CART_MUTATION, variables: { itemID: "abc123" } },
    result: {
      data: {
        addToCart: {
          ...fakeCartItem(),
          quantity: 1
        }
      }
    }
  }
];

describe("AddToCart component", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id={"abc123"} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("button")).toMatchSnapshot();
  });

  it("adds an item to cart when clicked", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <AddToCart id={"abc123"} />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    let me = (await apolloClient.query({
      query: CURRENT_USER_QUERY
    })).data.me;
    expect(me.cart).toHaveLength(0);
    wrapper.find("button").simulate("click");
    await wait();
    wrapper.update();
    me = (await apolloClient.query({
      query: CURRENT_USER_QUERY
    })).data.me;
    expect(me.cart).toHaveLength(1);
    expect(me.cart[0].id).toBe("omg123");
    expect(me.cart[0].quantity).toBe(3);
  });

  it("changes from add to adding when clicked", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id={"abc123"} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Add to Cart");

    wrapper.find("button").simulate("click");
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Adding to Cart");
  });
});
