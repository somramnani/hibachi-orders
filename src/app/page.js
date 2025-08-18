'use client';
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    guestName: '',
    proteins: ['', '', ''],
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const proteinOptions = [
    { value: 'chicken', label: 'Chicken', price: 0 },
    { value: 'shrimp', label: 'Shrimp', price: 0 },
    { value: 'salmon', label: 'Salmon', price: 0 },
    { value: 'steak', label: 'Steak', price: 0 },
    { value: 'scallops', label: 'Scallops', price: 0 },
    { value: 'vegetable', label: 'Vegetable (+tofu)', price: 0 },
    { value: 'filet-mignon', label: 'Filet Mignon (+$5)', price: 5 },
    { value: 'lobster-tail', label: 'Lobster Tail (+$10)', price: 10 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProteinChange = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.proteins];
      updated[index] = value;
      return { ...prev, proteins: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.proteins[0] || !formData.proteins[1] || !formData.proteins[2]) {
      alert('Please select a protein for Protein 1, Protein 2, and Protein 3.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit order');
      }
  
      setFormData({
        guestName: '',
        proteins: ['', '', ''],
        additionalNotes: ''
      });
    
       alert(`Added to the order! Thanks for submitting ${formData.guestName}.`)
    
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error submitting order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProteins = formData.proteins
    .map(v => proteinOptions.find(o => o.value === v))
    .filter(Boolean);
  const basePrice = 60;
  const totalPrice = basePrice + selectedProteins.reduce((sum, protein) => sum + protein.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🍳 Hibachi Orders For Frankies Bachelor Party
          </h1>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <p className="text-gray-600 leading-relaxed">
              We’ll be having Hibachi from {' '}
                <a 
                  href="https://www.hibachiomakase.com/hibachi-catering-pennsylvania-booking/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  Hibachi Catering Pennsylvania 
                </a>
                 {" "}on Sunday August 31st. Please choose  three protein options. The cost is $60 per person, which includes fried rice and noodles. 
                 If you wish to add Filet Mignon or Lobster Tail, please note that Filet Mignon is an additional $5 and Lobster Tail is an additional $10.
              </p>
            </div>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Place Your Order
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest  */}
            <div>
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name *
              </label>
              <input
                type="text"
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleInputChange}
                required
                placeholder="Enter guest name (e.g., John Smith, Jane Doe)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Please choose  three protein options
              </label>
              <div className="space-y-6">
                {[0,1,2].map((idx) => (
                  <div key={idx}>
                    <div className="text-xs text-gray-600 mb-2">{`Protein ${idx+1}`}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {proteinOptions.map((option) => {
                        const isSelected = formData.proteins[idx] === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`protein-${idx}`}
                              value={option.value}
                              checked={isSelected}
                              onChange={(e) => handleProteinChange(idx, e.target.value)}
                              required
                              className="sr-only"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{option.label}</div>
                              {option.price > 0 && (
                                <div className="text-sm text-orange-600 font-semibold">+${option.price}</div>
                              )}
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
                {/* Live selection feedback */}
                {(() => {
                const selectedCount = formData.proteins.filter(Boolean).length;
                if (selectedCount === 0) {
                  return (
                    <p className="text-sm text-red-600 mt-2">Please select three protein options</p>
                  );
                }
                if (selectedCount > 0 && selectedCount < 3) {
                  return (
                    <p className="text-sm text-orange-600 mt-2">Please select {3 - selectedCount} more protein option{3 - selectedCount !== 1 ? 's' : ''}</p>
                  );
                }
                if (selectedCount === 3) {
                  return (
                    <p className="text-sm text-green-600 mt-2">✓ Perfect! You&apos;ve selected all three protein options</p>
                  );
                }
                return null;
              })()}

            {/* Additional Notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special requests or dietary restrictions?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Price Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium text-gray-800">${basePrice}</span>
              </div>
              {selectedProteins.length > 0 && (
                <>
                  {selectedProteins.map((protein, idx) => (
                    <div key={`${protein.value}-${idx}`} className="flex justify-between items-center">
                      <span className="text-gray-600">{protein.label}:</span>
                      <span className="font-medium text-orange-600">+${protein.price}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total:</span>
                  <span className="font-bold text-lg text-gray-800">
                    ${totalPrice}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Order...
                </div>
              ) : (
                'Add to Order'
              )}
            </button>
          </form>
        </div>
         
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p className="mt-2 text-gray-400">Created by Som Ramnani</p>
        </div>
      </div>
    </div>
  );
}
