import { Point } from "./types";

export const comparePoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): boolean =>
	x1 === x2 && y1 === y2;
