import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import TakeMyMoney from "../components/TakeMyMoney";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import NProgress from "nprogress";
import Router from "next/router";

Router.router = {
  push: jest.fn()
};

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } }
  }
];

describe("TakeMyMoney component", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const checkoutButton = wrapper.find("ReactStripeCheckout");
    expect(toJSON(checkoutButton)).toMatchSnapshot();
  });

  it("creates an order ontoken", async () => {
    const createOrderMock = jest
      .fn()
      .mockResolvedValue({ data: { createOrder: { id: "abc123" } } });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    const component = wrapper.find("TakeMyMoney").instance();
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: "abc123" }
    });
  });

  it("starts a progress bar", () => {
    NProgress.start = jest.fn();
    const createOrderMock = jest
      .fn()
      .mockResolvedValue({ data: { createOrder: { id: "abc123" } } });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    const component = wrapper.find("TakeMyMoney").instance();
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(NProgress.start).toHaveBeenCalled();
    expect(NProgress.start).toHaveBeenCalledTimes(1);
  });

  it("routes to the new order page", () => {
    const createOrderMock = jest
      .fn()
      .mockResolvedValue({ data: { createOrder: { id: "abc123" } } });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    const component = wrapper.find("TakeMyMoney").instance();
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/order",
      query: { id: "abc123" }
    });
  });
});
