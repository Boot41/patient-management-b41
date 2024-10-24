import React from "react";

const SortComponent = ({ sortOption, setSortOption }) => {
  const handleSortChange = (e) => {
    console.log(`Sort option updated: ${e.target.value}`);
    setSortOption(e.target.value);
  };

  return (
    <div className="mb-6 flex items-center mt-0 pb-0">
      <label
        htmlFor="sort"
        className="block text-sm font-medium text-gray-700 mr-2"
      >
        Sort By:
      </label>
      <select
        id="sort"
        value={sortOption}
        onChange={handleSortChange}
        className="mb-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select</option>
        <option value="name">Name</option>
        <option value="experience">Experience</option>
      </select>
    </div>
  );
};

export default SortComponent;
