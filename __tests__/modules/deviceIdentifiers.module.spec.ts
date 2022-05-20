import { isOldSafari, isMobile, isIphone } from "../../src";

const OLD_SAFARI_USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1",
  "Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1",
  "Mozilla/5.0 (iPad; CPU OS 8_1_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B466 Safari/600.1.4",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53",
  "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_5_8) AppleWebKit/534.50.2 (KHTML, like Gecko) Version/5.0.6 Mobile/1231 Safari/533.22.3",
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-us) AppleWebKit/531.9 (KHTML, like Gecko) Version/4.0.3 Mobile/1231 Safari/531.9",
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_6; en-us) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/3.2.1 Mobile/1231 Safari/525.27.1",
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_6; en-us) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/2.1 Mobile/1231 Safari/525.27.1",
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_6; en-us) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/1.0 Mobile/1231 Safari/525.27.1",
];
const MODERN_SAFARI_USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1",
];
const IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1";
const ANDROID_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36";
const MAC_DESKTOP_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko)";
const WINDOWS_DESKTOP_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36";
const IPAD_USER_AGENT =
  "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
const GALAXY_TABLET_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 7.1.1; SM-T555 Build/NMF26X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Safari/537.36";
const DESKTOP_USER_AGENTS = [
  WINDOWS_DESKTOP_USER_AGENT,
  MAC_DESKTOP_USER_AGENT,
];
const MOBILE_USER_AGENTS = [
  ...OLD_SAFARI_USER_AGENTS,
  ...MODERN_SAFARI_USER_AGENTS,
  ANDROID_USER_AGENT,
  IPHONE_USER_AGENT,
];
const TABLET_USER_AGENTS = [IPAD_USER_AGENT, GALAXY_TABLET_USER_AGENT];
const NON_IPHONE_USER_AGENTS = [
  ...TABLET_USER_AGENTS,
  ...DESKTOP_USER_AGENTS,
  ANDROID_USER_AGENT,
];
const IPHONE_USER_AGENTS = [
  OLD_SAFARI_USER_AGENTS,
  MODERN_SAFARI_USER_AGENTS,
  IPHONE_USER_AGENT,
];
describe("isOldSafari", () => {
  it("will return false for user agents with safari 1 - 11", () => {
    for (let i = 0; i < OLD_SAFARI_USER_AGENTS.length; i++) {
      Object.defineProperty(global.navigator, "userAgent", {
        value: OLD_SAFARI_USER_AGENTS[i],
        configurable: true,
      });
      expect(isOldSafari()).toBe(true);
    }
  });

  it("will return false for user agents 12+", () => {
    for (let i = 0; i < MODERN_SAFARI_USER_AGENTS.length; i++) {
      Object.defineProperty(global.navigator, "userAgent", {
        value: MODERN_SAFARI_USER_AGENTS[i],
        configurable: true,
      });
      expect(isOldSafari()).toBe(false);
    }
  });
});

describe("isMobile", () => {
  it("will return false for desktops", () => {
    for (let i = 0; i < DESKTOP_USER_AGENTS.length; i++) {
      Object.defineProperty(global.navigator, "userAgent", {
        value: DESKTOP_USER_AGENTS[i],
        configurable: true,
      });
      expect(isMobile()).toBe(false);
    }
  });
  it("will return true for tablets", () => {
    for (let i = 0; i < TABLET_USER_AGENTS.length; i++) {
      Object.defineProperty(global.navigator, "userAgent", {
        value: TABLET_USER_AGENTS[i],
        configurable: true,
      });
      expect(isMobile()).toBe(true);
    }
  });
  it("will return true for mobiles", () => {
    for (let i = 0; i < MOBILE_USER_AGENTS.length; i++) {
      Object.defineProperty(global.navigator, "userAgent", {
        value: MOBILE_USER_AGENTS[i],
        configurable: true,
      });
      console.log(MOBILE_USER_AGENTS[i]);
      console.log(isMobile());
      expect(isMobile()).toBe(true);
    }
  });
});

describe("isIphone", () => {
  it("will return false for non iPhones", () => {
    for (let i = 0; i < NON_IPHONE_USER_AGENTS.length; i++) {
      Object.defineProperty(global.navigator, "userAgent", {
        value: NON_IPHONE_USER_AGENTS[i],
        configurable: true,
      });
      expect(isIphone()).toBe(false);
    }
  });
  it("will return true for iPhones", () => {
    for (let i = 0; i < IPHONE_USER_AGENTS.length; i++) {
      Object.defineProperty(global.navigator, "userAgent", {
        value: IPHONE_USER_AGENTS[i],
        configurable: true,
      });
      expect(isIphone()).toBe(true);
    }
  });
});
