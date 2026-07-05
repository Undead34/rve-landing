import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LAYOUT_SCHEMA_VERSION,
  collectTabIds,
  parseLayout,
  serializeLayout,
} from "./layout-codec.ts";

const KNOWN = new Set([
  "sections",
  "field-library",
  "metadata",
  "scope",
  "policy",
  "conditions",
  "consequence",
  "summary",
  "validation",
]);

const opts = { knownPanelIds: KNOWN };

/** A minimal but structurally real FlexLayout model JSON. */
function sampleModel() {
  return {
    global: {},
    borders: [
      {
        type: "border",
        location: "left",
        children: [
          {
            type: "tab",
            id: "sections",
            name: "Sections",
            component: "sections",
          },
          {
            type: "tab",
            id: "field-library",
            name: "Field Library",
            component: "field-library",
          },
        ],
      },
      {
        type: "border",
        location: "right",
        children: [
          {
            type: "tab",
            id: "validation",
            name: "Validation",
            component: "validation",
          },
        ],
      },
    ],
    layout: {
      type: "row",
      children: [
        {
          type: "tabset",
          id: "main_tabset",
          children: [
            {
              type: "tab",
              id: "metadata",
              name: "Metadata",
              component: "metadata",
            },
            {
              type: "tab",
              id: "conditions",
              name: "Conditions",
              component: "conditions",
            },
          ],
        },
      ],
    },
  };
}

test("collectTabIds walks borders, children, and the nested layout", () => {
  const ids = collectTabIds(sampleModel());
  assert.deepEqual(
    [...ids].sort(),
    [
      "conditions",
      "field-library",
      "metadata",
      "sections",
      "validation",
    ].sort(),
  );
});

test("serialize → parse round-trips a valid model", () => {
  const model = sampleModel();
  const restored = parseLayout(serializeLayout(model), opts);
  assert.deepEqual(restored, model);
});

test("parseLayout returns null for missing / blank input", () => {
  assert.equal(parseLayout(null, opts), null);
  assert.equal(parseLayout("", opts), null);
});

test("parseLayout returns null for malformed JSON", () => {
  assert.equal(parseLayout("{not json", opts), null);
});

test("parseLayout rejects a non-envelope (raw model without version)", () => {
  assert.equal(parseLayout(JSON.stringify(sampleModel()), opts), null);
});

test("parseLayout rejects an incompatible schema version", () => {
  const stale = JSON.stringify({
    version: LAYOUT_SCHEMA_VERSION + 1,
    model: sampleModel(),
  });
  assert.equal(parseLayout(stale, opts), null);
});

test("parseLayout rejects a model referencing an unknown tab id", () => {
  const model = sampleModel();
  // Simulate a layout saved by an older build with a since-removed tab id.
  model.layout.children[0].children.push({
    type: "tab",
    id: "conditions-nested",
    name: "nested",
    component: "conditions-nested",
  });
  const raw = serializeLayout(model);
  assert.equal(parseLayout(raw, opts), null);
});

test("parseLayout rejects an empty model (no tabs at all)", () => {
  const empty = serializeLayout({
    global: {},
    borders: [],
    layout: { type: "row", children: [] },
  });
  assert.equal(parseLayout(empty, opts), null);
});

test("version option overrides the default for both ends", () => {
  const raw = serializeLayout(sampleModel(), 7);
  assert.equal(parseLayout(raw, { ...opts, version: 7 }) !== null, true);
  assert.equal(parseLayout(raw, { ...opts, version: 8 }), null);
});
