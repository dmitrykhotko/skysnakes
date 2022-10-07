import { Point } from '../../../utils/types';
import { Action } from '../../redux';

export type StrategyResult = {
	success: boolean;
	actions?: Action[];
};

export abstract class ArenaStrategy {
	abstract run(point: Point, width: number, height: number, id?: number): StrategyResult;
}
