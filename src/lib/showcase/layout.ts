export const distanceByStep = [0, 5.63, 13, 20, 27] as const;

export function distanceForStep(step: number, distances: readonly number[] = distanceByStep) {
	const finalStep = distances.length - 1;
	const lowerStep = Math.min(finalStep, Math.max(1, Math.floor(step)));
	const upperStep = Math.min(finalStep, Math.max(1, Math.ceil(step)));
	return distances[lowerStep] + (distances[upperStep] - distances[lowerStep]) * (step - lowerStep);
}

export function positionOnCircle(angleDegrees: number, distance: number): [number, number] {
	const angle = (angleDegrees * Math.PI) / 180;
	return [Math.sin(angle) * distance, -Math.cos(angle) * distance];
}
