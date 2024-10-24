import React from "react";

const FilterSidebar = ({
  selectedSpecialization,
  setSelectedSpecialization,
}) => {
  const specializations = [
    "Cardiologist",
    "Dentist",
    "General Practitioner",
    "Dermatologist",
    "Orthopedic",
    "Pediatrician",
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-4">Filter by Specialization</h2>
      <div className="space-y-2">
        {specializations.map((specialization) => (
          <div key={specialization} className="flex items-center">
            <input
              type="radio"
              id={specialization}
              name="specialization"
              value={specialization}
              checked={selectedSpecialization === specialization}
              onChange={() => setSelectedSpecialization(specialization)}
              className="mr-2"
            />
            <label htmlFor={specialization} className="text-sm text-gray-700">
              {specialization}
            </label>
          </div>
        ))}
        <div className="flex items-center mt-4">
          <input
            type="radio"
            id="all"
            name="specialization"
            value=""
            checked={selectedSpecialization === ""}
            onChange={() => setSelectedSpecialization("")}
            className="mr-2"
          />
          <label htmlFor="all" className="text-sm text-gray-700">
            All Specializations
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
