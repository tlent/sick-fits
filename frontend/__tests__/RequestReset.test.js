import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import RequestReset, {
  REQUEST_RESET_MUTATION
} from "../components/RequestReset";

const MOCK_EMAIL = "email@gmail.com";
const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: MOCK_EMAIL }
    },
    result: {
      data: { requestReset: { message: "success", __typename: "Message" } }
    }
  }
];

describe("RequestReset component", () => {
  it("renders and matches snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    expect(
      toJSON(wrapper.find("form[data-test='RequestResetForm']"))
    ).toMatchSnapshot();
  });

  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: MOCK_EMAIL }
    });
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    expect(wrapper.find("p").text()).toContain(
      "Success! Check your email for a reset link."
    );
  });
});
