declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    [option: string]: unknown;
  }

  interface ImageTracerModule {
    optionpresets: {
      default: ImageTracerOptions;
      posterized2: ImageTracerOptions;
    };
    imageToSVG(
      image: string,
      callback: (svg: string) => void,
      options?: ImageTracerOptions,
    ): void;
  }

  const ImageTracer: ImageTracerModule;
  export default ImageTracer;
}

