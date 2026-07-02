type Chain = {
  to: () => Chain;
  fromTo: () => Chain;
  set: () => Chain;
  kill: () => Chain;
};

const chain = (): Chain => ({
  to: () => chain(),
  fromTo: () => chain(),
  set: () => chain(),
  kill: () => chain(),
});

const gsapMock = {
  to: () => chain(),
  fromTo: () => chain(),
  set: () => chain(),
  timeline: () => chain(),
  killTweensOf: () => {},
  context: (fn: () => void) => {
    fn();
    return { revert: () => {} };
  },
  utils: { toArray: (v: unknown) => (Array.isArray(v) ? v : []) },
};

export default gsapMock;
