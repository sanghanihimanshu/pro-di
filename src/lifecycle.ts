export enum LifecycleHook {
  INIT = "init",
  DESTROY = "destroy",
}

export interface WithLifecycle {
  [LifecycleHook.INIT]?: () => void | Promise<void>;
  [LifecycleHook.DESTROY]?: () => void | Promise<void>;
}

export async function runLifecycleHook(instance: any, hook: LifecycleHook): Promise<void> {
  if (instance && typeof instance[hook] === "function") {
    await instance[hook]();
  }
}
