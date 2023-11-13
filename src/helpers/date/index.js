const toLocalString = (date) => {
  const stringDate = new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return stringDate;
};

const currentDate = () => {
  return Date.now();
};

const date = { toLocalString, currentDate };

export default date;
