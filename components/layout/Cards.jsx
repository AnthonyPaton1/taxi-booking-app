"use client";

const Cards = ({ children }) => {
  return (
    <section className="w-full bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </section>
  );
};

export default Cards;
