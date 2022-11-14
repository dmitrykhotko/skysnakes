import { MessageType } from './messageType';

interface SendData {
	send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

export abstract class WSHlp {
	static send = <T extends SendData>(wS: T, type: MessageType, data?: unknown): void => {
		wS.send(
			JSON.stringify({
				type,
				data
			})
		);
	};

	static broadcast = <T extends SendData>(wSs: T[], type: MessageType, data?: unknown): void => {
		for (let i = 0; i < wSs.length; i++) {
			this.send(wSs[i], type, data);
		}
	};
}
