import { BrandIdentity, ImageSize, LogoResult, LogoVariation } from '../../types';

export type LogoKind = 'primary' | 'secondary';

export interface BrandDraft {
  identity: BrandIdentity;
  logos: LogoResult;
}

export interface GenerateBrandRequest {
  mission: string;
  imageSize: ImageSize;
}

export interface RegenerateLogoRequest {
  mission: string;
  kind: LogoKind;
  feedback?: string;
  imageSize?: ImageSize;
}

export interface RefineLogoRequest {
  image: string;
  instruction: string;
}

export interface BrandStudio {
  generateBrand(request: GenerateBrandRequest): Promise<BrandDraft>;
  regenerateLogo(request: RegenerateLogoRequest): Promise<string>;
  refineLogo(request: RefineLogoRequest): Promise<string>;
  generateVariations(image: string): Promise<LogoVariation[]>;
}

export type BrandStudioErrorCode =
  | 'authentication'
  | 'rate-limit'
  | 'invalid-request'
  | 'invalid-response'
  | 'provider-unavailable';

export class BrandStudioError extends Error {
  constructor(
    public readonly code: BrandStudioErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'BrandStudioError';
  }
}

