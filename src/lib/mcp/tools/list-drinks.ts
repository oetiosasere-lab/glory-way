import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { drinks } from "@/lib/drinks";

export default defineTool({
  name: "list_drinks",
  title: "List drinks",
  description:
    "List the Nigerian Breweries drinks Glory Way Limited stocks, optionally filtered by category. All drinks are sold by the crate.",
  inputSchema: {
    category: z
      .enum(["Lager", "Stout", "Malt", "Soft Drink", "Energy"])
      .optional()
      .describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category }) => {
    const items = drinks
      .filter((d) => !category || d.category === category)
      .map(({ slug, name, category: c, brewer, size, note }) => ({
        slug,
        name,
        category: c,
        brewer,
        size,
        note,
        soldBy: "crate",
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { drinks: items },
    };
  },
});