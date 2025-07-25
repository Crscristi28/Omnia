import React from 'react';

const CustomListItem = ({ children, index, isOrdered, isMobile }) => {
  // Určíme, co bude před textem: odrážka nebo číslo
  const marker = isOrdered ? `${index}.` : '•';

  // Odsazení pomocí Tailwind CSS
  const markerSpacing = isMobile ? 'mr-3' : 'mr-4'; // Mezera mezi odrážkou a textem
  const itemPaddingLeft = isMobile ? 'pl-8' : 'pl-10'; // Celkové odsazení položky

  return (
    <li className={`flex items-start mb-2 ${itemPaddingLeft}`}>
      <span className={`flex-shrink-0 ${markerSpacing}`} style={{
        // Styly pro samotnou odrážku/číslo
        color: '#FFFFFF', // Nebo barva tvého textu
        // Nastavení font-size a line-height markeru, pokud je potřeba ladit vertikálně
        // fontSize: '0.9em',
        // lineHeight: '1.2'
      }}>
        {marker}
      </span>
      <span className="flex-grow">
        {children}
      </span>
    </li>
  );
};

export default CustomListItem;