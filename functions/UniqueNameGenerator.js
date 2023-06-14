// Function to generate a unique filename (adds timestamp unix value before the filename to make it unique)
const UniqueNameGenerator = (originalName) => {
  const timestamp = Date.now();
  const uniqueName = `${timestamp}_${originalName}`;
  return uniqueName;
};

module.exports = {
  UniqueNameGenerator,
};
