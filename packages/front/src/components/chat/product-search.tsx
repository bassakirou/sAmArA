import { useState } from 'react';
import { IoSearchOutline, IoClose } from 'react-icons/io5';

interface ProductSearchProps {
  onClose: () => void;
}

const ProductSearch = ({ onClose }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock products
  const products = [
    { id: 1, name: 'MacBook Pro M1 2021 —...', price: '450 000 FCFA' },
    { id: 2, name: 'MacBook Air M2 2022 —...', price: '520 000 FCFA' },
    { id: 3, name: 'Apple Watch Series 8 —...', price: '180 000 FCFA' },
    { id: 4, name: 'Samsung Galaxy Watch 5', price: '120 000 FCFA' },
    { id: 5, name: 'AirPods Pro 2 — Reconditionnés', price: '150 000 FCFA' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
        <div className="relative flex-grow">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            autoFocus
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto max-h-[300px]">
        {products.map((product) => (
          <div 
            key={product.id}
            className="p-4 hover:bg-gray-50 cursor-pointer border-b flex justify-between items-center group transition-colors"
          >
            <div>
              <h5 className="font-bold text-sm group-hover:text-black transition-colors">{product.name}</h5>
              <p className="text-xs text-gray-400 mt-1">Ajouter à la négociation</p>
            </div>
            <span className="font-bold text-sm">{product.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSearch;
