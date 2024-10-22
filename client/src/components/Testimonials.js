import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Alice Johnson",
      feedback:
        "This app has made it so easy for me to book appointments with my doctor. Highly recommended!",
    },
    {
      id: 2,
      name: "Michael Smith",
      feedback:
        "Very user-friendly and convenient. I was able to find the right specialist in minutes.",
    },
    {
      id: 3,
      name: "Sarah Brown",
      feedback:
        "Booking an appointment has never been simpler. Great service and easy to use!",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-6">Testimonials</h2>
      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="p-4 border-b border-gray-200">
            <p className="text-lg font-semibold">{testimonial.name}</p>
            <p className="text-gray-700">"{testimonial.feedback}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
