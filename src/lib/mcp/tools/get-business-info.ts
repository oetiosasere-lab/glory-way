import { defineTool } from "@lovable.dev/mcp-js";

const info = {
  name: "Glory Way Limited",
  description:
    "Licensed sub-distributor of Nigerian Breweries drinks, delivering by the crate to homes and events in Benin City and across Edo State.",
  phone: "0705 165 6621",
  email: "gloryomosigho@gmail.com",
  address:
    "Imasabor Number 19 Oduware, along Saple Road, NNPC Junction, Ikpoba Okha, Benin City, Edo State, Nigeria",
  hours: "Open 11 hours a day, 6 days a week, 365 days a year",
  soldBy: "Crates only — no single-bottle sales",
  ageRestriction: "Alcoholic drinks are sold to customers aged 18 and over only",
};

export default defineTool({
  name: "get_business_info",
  title: "Get business info",
  description:
    "Get Glory Way Limited's contact details, warehouse address, opening hours, and ordering policy.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
    structuredContent: info,
  }),
});