import { redirect } from "modules";

const NO_ARG_ERR = "Provide a url to redirect to as arg 1";
const URL = "/hey";
describe("redirect", () => {
  const mockWindow = () => {
    const origin = { ...window.location };
    delete window.location;
    const spy = jest.fn();
    window.location = { ...origin, assign: spy };
    return spy;
  };
  it("will throw the correct error if no arg is provided", () => {
    // @ts-ignore-next-line
    expect(() => redirect()).toThrow(NO_ARG_ERR);
  });

  it("will call window.assign if a url is provided as arg 1", () => {
    const spy = mockWindow();
    redirect(URL);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(URL);
  });
});
