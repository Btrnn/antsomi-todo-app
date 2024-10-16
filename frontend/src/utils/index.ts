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

export const reorderDoubleArrays = (
  listSource: any[],
  listDestination: any[],
  startIndex: number,
  endIndex: number,
) => {
  const sourceArray = Array.from(listSource);
  const destinationArray = Array.from(listDestination);
  const [removed] = sourceArray.splice(startIndex, 1);
  if (endIndex >= destinationArray.length - 1 && destinationArray.length - 1 !== 0) {
    destinationArray.push(removed);
  } else {
    destinationArray.splice(endIndex, 0, removed);
  }
  return [sourceArray, destinationArray];
};

export const getContrastTextColor = (bgColor: string) => {
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 200 ? '#000000' : '#FFFFFF';
};

export const checkAuthority = (userPermission: string, rolesAccepted: string[]) => {
  if (rolesAccepted.includes(userPermission)) {
    return true;
  }
  return false;
};