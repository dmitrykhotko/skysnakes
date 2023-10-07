import { Direction } from '../../common/enums';
import { Id, LinkedPoint, ObjectWithId, Point, Size } from '../../common/types';
import { ArenaStore } from '../redux';
import { State } from '../redux/state';

export abstract class Hlp {
    private static lastId = 0;

    private static nextPointCreators = {
        [Direction.Up]: (point: LinkedPoint, delta = 1): LinkedPoint => [point[0], point[1] - delta],
        [Direction.Down]: (point: LinkedPoint, delta = 1): LinkedPoint => [point[0], point[1] + delta],
        [Direction.Left]: (point: LinkedPoint, delta = 1): LinkedPoint => [point[0] - delta, point[1]],
        [Direction.Right]: (point: LinkedPoint, delta = 1): LinkedPoint => [point[0] + delta, point[1]]
    };

    static nextPoint = (point: LinkedPoint, direction: Direction): LinkedPoint => {
        return this.nextPointCreators[direction](point);
    };

    static comparePoints = ([x1, y1]: LinkedPoint, [x2, y2]: LinkedPoint): boolean => x1 === x2 && y1 === y2;

    static id = (): Id => ++this.lastId;

    static lcm = (...x: number[]): number => {
        let j = Math.max(...x);

        while (true) {
            if (x.every(b => j % b === 0)) {
                break;
            } else {
                j++;
            }
        }

        return j;
    };

    static randomInt = (max: number, min = 0): number => Math.floor(Math.random() * (max - min + 1)) + min;

    static filter = <T>(
        items: T[],
        prop: keyof T,
        value: T[keyof T],
        predicate = (item1: T[keyof T], item2: T[keyof T]): boolean => item1 !== item2
    ): T[] => {
        const targets = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (predicate(item[prop], value)) {
                targets.push(item);
            }
        }

        return targets;
    };

    static excludeById = <T extends ObjectWithId>(items: T[], id: T[keyof T]): T[] => {
        return this.filter(items, 'id', id);
    };

    static mapByProp = <T>(arr: T[], prop: keyof T): T[keyof T][] => {
        const result = [] as T[keyof T][];

        for (let i = 0; i < arr.length; i++) {
            result.push(arr[i][prop]);
        }

        return result;
    };

    static getSize = (state: State): Size => state.get<ArenaStore>().arena.size;

    static lPointsToPoints = (lPoints: LinkedPoint[]): Point[] => {
        const points = [] as Point[];

        for (let i = 0; i < lPoints.length; i++) {
            const [x, y] = lPoints[i];
            points.push([x, y]);
        }

        return points;
    };
}
