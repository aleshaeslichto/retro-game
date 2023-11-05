import { calcTileType } from "../utils";

test('calcTileType_1', () => {
    const index = 0;
    const boardSize = 8;
    const expected = 'top-left';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_2', () => {
    const index = 5;
    const boardSize = 8;
    const expected = 'top';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_3', () => {
    const index = 7;
    const boardSize = 8;
    const expected = 'top-right';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_4', () => {
    const index = 16;
    const boardSize = 8;
    const expected = 'left';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_5', () => {
    const index = 18;
    const boardSize = 8;
    const expected = 'center';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_6', () => {
    const index = 23;
    const boardSize = 8;
    const expected = 'right';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_7', () => {
    const index = 56;
    const boardSize = 8;
    const expected = 'bottom-left';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_8', () => {
    const index = 60;
    const boardSize = 8;
    const expected = 'bottom';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_9', () => {
    const index = 63;
    const boardSize = 8;
    const expected = 'bottom-right';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});

test('calcTileType_10', () => {
    const index = 7;
    const boardSize = 7;
    const expected = 'left';
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
});