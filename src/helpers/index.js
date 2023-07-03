export function foldersArrayToTree(items) {
  const map = {};
  const result = [];

  items.forEach((item) => {
    item.children = [];
    map[item.id] = item;
  });

  items.forEach((item) => {
    const { folderFatherId } = item;
    if (folderFatherId) {
      const parent = map[folderFatherId];
      parent.children.push(item);
    } else {
      result.push(item);
    }
  });

  return result[0];
}
