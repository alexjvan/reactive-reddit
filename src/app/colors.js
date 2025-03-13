import { getRandomInt } from './numbers';

// return something like ffffff
export function randSixHash() {
	return (Math.random() * 0xffffff | 0).toString(16).padStart(6, '0');
}