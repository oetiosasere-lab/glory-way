import { defineMcp } from "@lovable.dev/mcp-js";
import listDrinksTool from "./tools/list-drinks";
import getBusinessInfoTool from "./tools/get-business-info";

export default defineMcp({
  name: "glory-greens-golds",
  title: "Glory Greens & Golds",
  version: "0.1.0",
  instructions:
    "Tools for Glory Way Limited, a Nigerian Breweries sub-distributor. Use `list_drinks` to see the crate catalogue and `get_business_info` for contact details, address, and opening hours.",
  tools: [listDrinksTool, getBusinessInfoTool],
});