type TextNode = {
  type: "text";
  version: 1;
  detail: 0;
  format: 0;
  mode: "normal";
  style: "";
  text: string;
};

type BaseRoot = {
  type: "root";
  version: 1;
  direction: null;
  format: "";
  indent: 0;
  children: unknown[];
};

const text = (value: string): TextNode => ({
  type: "text",
  version: 1,
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: value,
});

const wrap = (children: unknown[]): { root: BaseRoot } => ({
  root: {
    type: "root",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children,
  },
});

export const paragraph = (value: string) =>
  wrap([
    {
      type: "paragraph",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [text(value)],
    },
  ]);

export const heading = (level: 1 | 2 | 3, value: string) =>
  wrap([
    {
      type: "heading",
      tag: `h${level}`,
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [text(value)],
    },
  ]);

export const list = (items: string[], ordered = false) =>
  wrap([
    {
      type: "list",
      listType: ordered ? "number" : "bullet",
      tag: ordered ? "ol" : "ul",
      start: 1,
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: items.map((item, i) => ({
        type: "listitem",
        value: i + 1,
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: [text(item)],
      })),
    },
  ]);

export const empty = () => wrap([]);

export const asJson = (state: { root: BaseRoot }) => JSON.stringify(state);
