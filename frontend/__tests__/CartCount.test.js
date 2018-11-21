import { shallow } from "enzyme";
import CartCount from "../components/CartCount";

describe("<CartCount/>", () => {
  it("renders", () => {
    shallow(<CartCount count={10} />);
  });

  it("matches the snapshot", () => {
    const wrapper = shallow(<CartCount count={11} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("updates via props", () => {
    const wrapper = shallow(<CartCount count={50} />);
    expect(wrapper).toMatchSnapshot();
    wrapper.setProps({ count: 10 });
    expect(wrapper).toMatchSnapshot();
  });
});
