// src/utils/formatSalary.js

export const formatSalary = (min, max) => {
  const minSalary = Number(min);
  const maxSalary = Number(max);

  const hasMin =
    Number.isFinite(minSalary) &&
    minSalary > 0;

  const hasMax =
    Number.isFinite(maxSalary) &&
    maxSalary > 0;

  // No valid salary data
  if (!hasMin && !hasMax) {
    return null;
  }

  const format = (value) => {
    if (value >= 100000) {
      const lakhs = value / 100000;

      const formatted =
        Number.isInteger(lakhs)
          ? lakhs.toFixed(0)
          : lakhs.toFixed(1);

      return `₹${formatted} Lakh${lakhs === 1 ? "" : "s"}`;
    }

    if (value >= 1000) {
      const thousands = value / 1000;

      const formatted =
        Number.isInteger(thousands)
          ? thousands.toFixed(0)
          : thousands.toFixed(1);

      return `₹${formatted}K`;
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  // Both min and max
  if (hasMin && hasMax) {
    return `${format(minSalary)} – ${format(maxSalary)}`;
  }

  // Only minimum
  if (hasMin) {
    return `From ${format(minSalary)}`;
  }

  // Only maximum
  return `Up to ${format(maxSalary)}`;
};

export default formatSalary;