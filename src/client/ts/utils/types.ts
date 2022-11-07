import { ModalType } from './enums';

export type ShowModalArgs = {
	type: ModalType;
	topContent?: string;
	mainContent?: string;
	bottomContent?: string;
	isStatic?: boolean;
};
