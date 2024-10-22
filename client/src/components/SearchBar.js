import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const handleSearchChange = (e) => {
    console.log(`Search query updated: ${e.target.value}`);
    setSearchQuery(e.target.value);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search doctors by name..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchBar;
