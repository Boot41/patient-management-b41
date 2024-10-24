import React from "react";
import testimonialIcon from "../../assets/testimonialIcon.png";

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
    <div className="mt-20 p-4 bg-blue-50 border-t-2 border-gray-300 pb-10">
      <h2 className="text-3xl font-bold text-center text-gray-700 mb-10">
        What Our Patients Say
      </h2>
      <div className="flex flex-col md:flex-row gap-10 justify-center">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="text-center p-8 bg-white rounded-lg shadow-lg max-w-sm transition-transform transform hover:scale-105"
          >
            <img
              src={testimonialIcon}
              alt="Testimonial"
              className="w-20 mx-auto mb-6 rounded-full border-4 border-blue-500"
            />
            <p className="text-gray-700 italic mb-6">{testimonial.feedback}</p>
            <p className="text-blue-700 font-bold">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
