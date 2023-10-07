import { UUId } from '../../../common/types';

export type CanvasRendererProps = {
    presenterEl: HTMLCanvasElement;
    statEl: HTMLCanvasElement;
    serviceEl: HTMLCanvasElement;
    cellSize?: number;
    lineHeight?: number;
};

export type GameProps = {
    showServiceInfo: boolean;
    roomUUId?: UUId;
};
