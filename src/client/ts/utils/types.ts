import { Size, UUId } from '../../../common/types';

export type CanvasRendererProps = {
	presenterEl: HTMLCanvasElement;
	statEl: HTMLCanvasElement;
	serviceEl: HTMLCanvasElement;
	size: Size;
	cellSize?: number;
	lineHeight?: number;
};

export type GameProps = {
	showServiceInfo: boolean;
	roomUUId?: UUId;
};
