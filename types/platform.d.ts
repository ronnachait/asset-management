// types/platform.d.ts
declare module "platform" {
  interface Platform {
    name?: string;
    version?: string;
    layout?: string;
    os?: {
      family?: string;
      version?: string;
    };
    description?: string;
    product?: string;
    manufacturer?: string;
    toString(): string;
  }

  const platform: Platform;
  export default platform;
}
