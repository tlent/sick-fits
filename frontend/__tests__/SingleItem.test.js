import { mount } from "enzyme";
import wait from "waait";
import SingleItem, { SINGLE_ITEM_QUERY } from "../components/SingleItem";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";

describe("SingleItem component", () => {
  it("renders with proper data", async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        result: { data: { item: fakeItem() } }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id={"123"} />
      </MockedProvider>
    );
    expect(wrapper.text()).toContain("Loading");
    await wait();
    wrapper.update();
    expect(wrapper.find("h2")).toMatchSnapshot();
    expect(wrapper.find("img")).toMatchSnapshot();
    expect(wrapper.find("p")).toMatchSnapshot();
  });

  it("errors with a not found item", async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        result: { errors: [{ message: "Items not found!" }] }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id={"123"} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const item = wrapper.find('[data-test="graphql-error"]');
    expect(item.text()).toContain("Items not found!");
    expect(item).toMatchSnapshot();
  });
});
