declare module 'lamejs' {
  // Constants
  export const MONO: number;
  export const STEREO: number;
  
  // MP3 Encoder
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, bitrate: number);
    encodeBuffer(buffer: Int16Array): Uint8Array;
    encodeBuffer(bufferL: Int16Array, bufferR?: Int16Array): Uint8Array;
    flush(): Uint8Array;
  }
  
  // WAV Header Parser
  export class WavHeader {
    static readHeader(dataView: DataView): {
      channels: number;
      sampleRate: number;
      bitDepth: number;
      dataOffset: number;
      dataLen: number;
    };
    
    static readWAV(audioData: ArrayBuffer): {
      data: Uint8Array;
      channels: number;
      sampleRate: number;
      bitDepth: number;
    };
  }
  
  // Utility Types
  export interface Mp3Config {
    channels?: number;
    sampleRate?: number;
    bitrate?: number;
    mode?: number;
  }
}
