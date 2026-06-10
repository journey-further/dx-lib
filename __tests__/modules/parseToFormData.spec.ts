import { parseJsonToFormData } from "../../src";

interface JsonData {
  [key: string]: string | number;
}

const WRONG_ARGUMENT_TYPE_ERROR_MESSAGE = "Parameter 1 must be of type object";
const JSON_DATA: JsonData = {
  arg: "hey",
  arg1: 12,
  arg3: "wut",
};
describe("parseToFormData", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("will throw if the argument is not a json", () => {
    // @ts-expect-error
    expect(() => parseJsonToFormData("Hey")).toThrowError(WRONG_ARGUMENT_TYPE_ERROR_MESSAGE);
  });

  it("will not throw if the argument is a json", () => {
    expect(() => parseJsonToFormData({ yo: "hey" })).not.toThrow();
  });

  it("will return a form data object with the correct keys and values converted to strings", () => {
    const result = parseJsonToFormData(JSON_DATA);
    const values = [...result.values()];
    const keys = [...result.keys()];

    for (let key of Object.keys(JSON_DATA)) {
      expect(keys.includes(key)).toBe(true);
      expect(values.includes(`${JSON_DATA[key]}`)).toBe(true);
      expect(typeof values[values.indexOf(`${JSON_DATA[key]}`)]).toBe("string");
    }

    expect(result instanceof FormData).toBe(true);
  });
});
