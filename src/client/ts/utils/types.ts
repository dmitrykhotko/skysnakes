import { Size, UUId } from '../../../common/types';
import { ModalType } from './enums';

export type CanvasRendererProps = {
	presenterEl: HTMLCanvasElement;
	statEl: HTMLCanvasElement;
	serviceEl: HTMLCanvasElement;
	size: Size;
	cellSize?: number;
	lineHeight?: number;
};

export type ShowModalArgs = {
	type: ModalType;
	topContent?: string;
	mainContent?: string;
	bottomContent?: string;
	isStatic?: boolean;
};

export type GameProps = {
	showServiceInfo: boolean;
	roomUUId?: UUId;
};
