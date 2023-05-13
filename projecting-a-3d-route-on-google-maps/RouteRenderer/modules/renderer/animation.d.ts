export type Animation = {
    type: "distance" | "elevation";
    forwards: boolean;
    interval: number;
    repeat: boolean;
    progress?: AnimationProgress;
};
export type AnimationProgress = {
    elapsed: number;
};
export type AnimationFrame = {
    distanceFraction: number;
    elevationFraction: number;
};
//# sourceMappingURL=animation.d.ts.map