import React from 'react';

const CustomListItem = ({ children, index, isOrdered }) => {
  const marker = isOrdered ? `${index}.` : '•';

  // V CustomListItem ODSTRAŇTE jakékoliv PL-*, ML-*, -INDENT-* Tailwind třídy nebo inline styly.
  // ODSTRAŇTE i jakoukoliv dynamickou kalkulaci odsazení přes 'indent' proměnnou.
  // Odsazení bude nyní ŘÍDIT CSS definované v index.css.
  // Zde se jen definuje flexbox chování a mezera mezi markerem a textem.
  return (
    <li className={`flex items-start mb-2`}>
      <span className="flex-shrink-0 mr-3"> {/* mr-3 pro mezeru mezi markerem a textem */}
        {marker}
      </span>
      <span className="flex-grow">
        {children}
      </span>
    </li>
  );
};

export default CustomListItem;