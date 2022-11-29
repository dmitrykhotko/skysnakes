import { SoundLib } from './soundLibrary';

export class Audio {
	private ctx: AudioContext;
	private vol: GainNode;
	private sounds = {} as Record<string, { isPlaying: boolean }>;
	private bMSource?: AudioBufferSourceNode;

	constructor() {
		this.ctx = new AudioContext();
		this.vol = this.ctx.createGain();
		this.vol.connect(this.ctx.destination);
		this.vol.gain.value = 1;
	}

	async play(sound: string): Promise<void> {
		!this.sounds[sound] && (this.sounds[sound] = { isPlaying: false });

		// if (this.sounds[sound].isPlaying) {
		// 	return;
		// }

		// this.sounds[sound].isPlaying = true;

		const arrayBuffer = await this.getSoundFile(sound);
		const source = this.ctx.createBufferSource();

		void this.ctx.decodeAudioData(arrayBuffer, audioBuffer => {
			source.buffer = audioBuffer;
			source.connect(this.vol);
			source.loop = false;
			source.onended = (): void => {
				this.terminateSound(source);
				this.sounds[sound].isPlaying = false;
			};
			source.start();
		});
	}

	async bMOnOff(): Promise<boolean> {
		const sound = SoundLib.bMusic;

		!this.sounds[sound] && (this.sounds[sound] = { isPlaying: false });

		if (this.sounds[sound].isPlaying) {
			this.terminateSound(this.bMSource);
			this.sounds[sound].isPlaying = false;

			return false;
		}

		const bgmVol = this.ctx.createGain();
		bgmVol.connect(this.vol);
		bgmVol.gain.value = 0.25;

		const arrayBuffer = await this.getSoundFile(sound);
		const source = this.ctx.createBufferSource();

		void this.ctx.decodeAudioData(arrayBuffer, audioBuffer => {
			source.buffer = audioBuffer;
			source.connect(bgmVol);
			source.loop = true;
			source.start();
		});

		this.bMSource = source;
		this.sounds[sound].isPlaying = true;

		return true;
	}

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
