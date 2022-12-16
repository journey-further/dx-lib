import { jfEvents } from "types/constants";
import { JfEvent } from "types/defs";

export const isJfEvent = (event: JfEvent): event is JfEvent => jfEvents.includes(event);
