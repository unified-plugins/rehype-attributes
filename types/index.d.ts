// TypeScript Version: 3.7

import { Node } from 'unist';

declare namespace rehypeAttribute {
  interface AttrOptions {
    [tagName: string]: (node: Node) => void;
  }
}

declare function rehypeAttrs(
  settings?: rehypeAttribute.AttrOptions,
): (node: Node) => void;

export = rehypeAttrs;
