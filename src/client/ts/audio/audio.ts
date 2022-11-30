import { SoundLib } from './soundLibrary';

export class Audio {
	private ctx: AudioContext;
	private vol: GainNode;
	private sounds = {} as Record<string, { isPlaying: boolean; buffer?: AudioBuffer }>;
	private bMSource?: AudioBufferSourceNode;

	constructor() {
		this.ctx = new AudioContext();
		this.vol = this.ctx.createGain();
		this.vol.connect(this.ctx.destination);
		this.vol.gain.value = 1;
	}

	async play(sound: string, loop = false, terminate = true): Promise<AudioBufferSourceNode> {
		!this.sounds[sound] && (this.sounds[sound] = { isPlaying: false });

		const { buffer } = this.sounds[sound];
		const source = this.ctx.createBufferSource();

		if (buffer) {
			this.playBuffer(source, buffer, loop, terminate);
			return source;
		}

		const arrayBuffer = await this.getSoundFile(sound);
		void this.ctx.decodeAudioData(arrayBuffer, audioBuffer => {
			this.sounds[sound].buffer = audioBuffer;
			this.playBuffer(source, audioBuffer, loop, terminate);
		});

		return source;
	}

	async bMOnOff(): Promise<boolean> {
		const sound = SoundLib.bMusic;

		!this.sounds[sound] && (this.sounds[sound] = { isPlaying: false });

		if (this.sounds[sound].isPlaying) {
			this.terminateSound(this.bMSource);
			this.sounds[sound].isPlaying = false;

			return false;
		}

		// const arrayBuffer = await this.getSoundFile(sound);
		// const source = this.ctx.createBufferSource();

		// void this.ctx.decodeAudioData(arrayBuffer, audioBuffer => {
		// 	source.buffer = audioBuffer;
		// 	source.connect(this.vol);
		// 	source.loop = true;
		// 	source.start();
		// });

		const source = await this.play(sound, true, false);

		this.bMSource = source;
		this.sounds[sound].isPlaying = true;

		return true;
	}

	private playBuffer = (
		source: AudioBufferSourceNode,
		buffer: AudioBuffer,
		loop: boolean,
		terminate: boolean
	): void => {
		source.buffer = buffer;
		source.connect(this.vol);
		source.loop = loop;

		terminate &&
			(source.onended = (): void => {
				this.terminateSound(source);
			});

		source.start();
	};

	private async getSoundFile(url: string): Promise<ArrayBuffer> {
		const buf = fetch(url).then(res => res.arrayBuffer());
		return await buf;
	}

	private terminateSound(source?: AudioBufferSourceNode): void {
		if (!source) {
			return;
		}

		source.stop();
		source.disconnect();
	}
}
