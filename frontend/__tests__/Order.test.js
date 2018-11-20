import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import Order, { SINGLE_ORDER_QUERY } from "../components/Order";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeOrder } from "../lib/testUtils";

const mocks = [
  {
    request: { query: SINGLE_ORDER_QUERY, variables: { id: "abc123" } },
    result: { data: { order: { ...fakeOrder(), id: "abc123" } } }
  }
];

describe("Order component", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Order id={"abc123"} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find("div[data-test='Order']"))).toMatchSnapshot();
  });
});
