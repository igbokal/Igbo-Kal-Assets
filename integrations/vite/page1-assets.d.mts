export interface IgboKalViteAlias {
  find: string;
  replacement: string;
}

export declare const igbokalAssetsRoot: string;
export declare const igbokalAssetsAliasName: '@igbokal-assets';
export declare const igbokalAssetsAlias: IgboKalViteAlias;

export declare const page1AssetsRoot: string;
export declare const page1AssetsAliasName: '@igbokal-page1-assets';
export declare const page1AssetsAlias: IgboKalViteAlias;

export declare function assertLocalPage1AssetBridge(): IgboKalViteAlias;
export declare function assertLocalIgboKalAssetBridge(): IgboKalViteAlias;
export declare function requirePublishedPage1AssetBaseUrl(): string;
