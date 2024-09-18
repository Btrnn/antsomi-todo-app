/**
 * Reorders an array by moving an item from the start index to the end index.
 *
 * @param {Array} list The array to reorder.
 * @param {number} startIndex The index of the item to move.
 * @param {number} endIndex The index where to move the item.
 * @returns {Array} The reordered array.
 */

export const reorderSingleArray = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const reorderDoubleArrays = (listSource: any[], listDestination: any[], startIndex: number, endIndex: number) => {
  const sourceArray = Array.from(listSource);
  const destinationArray = Array.from(listDestination);
  const [removed] = sourceArray.splice(startIndex, 1);
  destinationArray.splice(endIndex, 0, removed);
  return [...sourceArray, ...destinationArray];
};
