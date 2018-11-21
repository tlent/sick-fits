import { mount } from "enzyme";
import wait from "waait";
import Pagination, { PAGINATION_QUERY } from "../components/Pagination";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";

Router.router = {
  push() {},
  prefetch() {}
};

function makeMocksFor(itemCount) {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: "aggregate",
            aggregate: { __typename: "count", count: itemCount }
          }
        }
      }
    }
  ];
}

describe("Pagination component", () => {
  it("displays a loading message", () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    expect(wrapper.text()).toContain("Loading");
  });

  it("renders pagination for 18 items", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find(".totalPages").text()).toEqual("5");
    const pagination = wrapper.find('div[data-test="pagination"]');
    expect(pagination).toMatchSnapshot();
  });

  it("disables prev button on first page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toBe(true);
    expect(wrapper.find("a.next").prop("aria-disabled")).toBe(false);
  });

  it("disables next button on last page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={5} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toBe(false);
    expect(wrapper.find("a.next").prop("aria-disabled")).toBe(true);
  });

  it("enables all buttons on middle page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={3} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toBe(false);
    expect(wrapper.find("a.next").prop("aria-disabled")).toBe(false);
  });
});
