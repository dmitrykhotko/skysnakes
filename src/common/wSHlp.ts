import { MessageType } from './messageType';

interface SendData {
	send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

export abstract class WSHlp {
	static send = <T extends SendData>(wS: T, t: MessageType, d?: unknown): void => {
		wS.send(
			JSON.stringify({
				t,
				d
			})
		);
	};

	static broadcast = <T extends SendData>(wSs: T[], t: MessageType, d?: unknown): void => {
		for (let i = 0; i < wSs.length; i++) {
			this.send(wSs[i], t, d);
		}
	};
}
