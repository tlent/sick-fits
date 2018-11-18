import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import CreateItem, { CREATE_ITEM_MUTATION } from "../components/CreateItem";
import { fakeItem } from "../lib/testUtils";
import Router from "next/router";

const dogImage = "https://dog.com/dog.jpg";
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({ secure_url: dogImage, eager: [{ secure_url: dogImage }] })
});

describe("CreateItem component", () => {
  it("renders and matches snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    expect(
      toJSON(wrapper.find("form[data-test='CreateItemForm']"))
    ).toMatchSnapshot();
  });

  it("uploads a file when changed", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    wrapper
      .find("input[type='file']")
      .simulate("change", { target: { files: ["dog.jpg"] } });
    await wait();
    wrapper.update();
    const component = wrapper.find("CreateItem").instance();
    expect(component.state.image).toEqual(dogImage);
    expect(component.state.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();
    global.fetch.mockReset();
  });

  it("handles state updating", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    wrapper
      .find("#title")
      .simulate("change", { target: { value: "testing", name: "title" } });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: 50000, type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: "nice item" }
    });

    expect(wrapper.find("CreateItem").instance().state).toMatchObject({
      title: "testing",
      price: 50000,
      description: "nice item"
    });
  });

  it("creates an item when the form is submitted", async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            description: item.description,
            image: "",
            largeImage: "",
            price: item.price
          }
        },
        result: {
          data: {
            createItem: {
              ...fakeItem,
              id: "abc123",
              __typename: "Item"
            }
          }
        }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );
    wrapper
      .find("#title")
      .simulate("change", { target: { value: item.title, name: "title" } });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: item.price, type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: item.description }
    });
    Router.router = { push: jest.fn() };
    wrapper.find("form").simulate("submit");
    await wait(50);
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/item",
      query: { id: "abc123" }
    });
  });
});
