import { Bullet } from '../../../common/types';
import { BulletsStore } from '../../redux';
import { Action, BinActions, BulletsActions } from '../../redux/actions';
import { State } from '../../redux/state';
import { Hlp } from '../../utils/hlp';

export class Bullets {
    constructor(private state: State) {}

    move = (): void => {
        const collisionActions = [] as Action[];
        const bullets = this.state.get<BulletsStore>().bullets;

        for (let i = 0; i < bullets.length; i++) {
            const { id, player, point, direction } = bullets[i];
            const nextPoint = Hlp.nextPoint(point, direction);
            const newBullet = { id, player, point: nextPoint, direction };

            this.state.dispatch(BulletsActions.setBullet(newBullet), BinActions.moveToBin([point]));
            collisionActions.push(...this.checkCollisions(newBullet));
        }

        this.state.dispatch(...collisionActions);
    };

    remove = (bullet: Bullet): Action[] => {
        const { id, point } = bullet;
        const bin = [point];

        return [BulletsActions.remove(id), BinActions.moveToBin(bin)];
    };

    private checkCollisions = (bullet: Bullet): Action[] => {
        const {
            id,
            point: [x, y]
        } = bullet;
        const actions = [] as Action[];
        const bullets = this.state.get<BulletsStore>().bullets;

        let result = false;

        for (let i = 0; i < bullets.length; i++) {
            const currBullet = bullets[i];
            const {
                id: currId,
                point: [currX, currY]
            } = bullets[i];

            if (id === currId || !(x === currX && y === currY)) {
                continue;
            }

            if (!result) {
                actions.push(...this.remove(bullet));
                result = true;
            }

            actions.push(...this.remove(currBullet));
        }

        return actions;
    };
}
