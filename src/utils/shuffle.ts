// Adapted from https://bost.ocks.org/mike/shuffle/
export function shuffle<T>(input: T[], random = Math.random): T[] {
    const result = [ ...input ];
    for (let index = input.length; index > 0;) {
        const randomIndex = Math.floor(random() * index--);
        const element = result[index];
        result[index] = result[randomIndex];
        result[randomIndex] = element;
    }
    return result;
}
