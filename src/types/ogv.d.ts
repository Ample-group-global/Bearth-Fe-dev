declare module "ogv" {
  export class OGVPlayer {
    src: string;
    width: number;
    height: number;
    muted: boolean;
    loop: boolean;
    autoplay: boolean;
    currentTime: number;
    duration: number;
    paused: boolean;
    ended: boolean;
    volume: number;

    constructor(options?: { oggURL?: string; wasmURL?: string });

    load(): void;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    addEventListener(event: string, callback: EventListener): void;
    removeEventListener(event: string, callback: EventListener): void;
  }

  export class OGVLoader {
    static base: string;
  }
}
