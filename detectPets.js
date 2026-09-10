/**
 * Pet Detection Script for Farmers Market Listings
 * Detects and identifies pets listed in farmers market vendor data
 */

const petKeywords = [
  'dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'bird', 'parrot', 'budgie',
  'fish', 'goldfish', 'turtle', 'snake', 'lizard', 'bearded dragon', 'gecko',
  'ferret', 'chinchilla', 'hedgehog', 'puppy', 'kitten', 'chick', 'duckling',
  'horse', 'pony', 'goat', 'sheep', 'chicken', 'duck', 'rabbit', 'squirrel',
  'possum', 'raccoon', 'fox', 'pig', 'cow', 'buffalo', 'llama', 'alpaca',
  'pet', 'animal', 'livestock'
];

/**
 * Main function to detect pets in farmers market listings
 * @param {Array} listings - Array of listing objects
 * @returns {Object} Detection results with detected pets and statistics
 */
function detectPetsInListings(listings) {
  if (!Array.isArray(listings)) {
    throw new Error('Listings must be an array');
  }

  const detectedPets = [];
  const statistics = {
    totalListings: listings.length,
    listingsWithPets: 0,
    petTypes: {},
    vendors: []
  };

  listings.forEach((listing, index) => {
    const petMatch = checkForPets(listing);
    
    if (petMatch.found) {
      statistics.listingsWithPets++;
      
      petMatch.pets.forEach(pet => {
        statistics.petTypes[pet] = (statistics.petTypes[pet] || 0) + 1;
      });

      detectedPets.push({
        listingIndex: index,
        vendor: listing.vendor || 'Unknown',
        title: listing.title || 'No title',
        description: listing.description || 'No description',
        detectedPets: petMatch.pets,
        confidence: petMatch.confidence,
        matchedText: petMatch.matchedText
      });

      if (!statistics.vendors.includes(listing.vendor)) {
        statistics.vendors.push(listing.vendor);
      }
    }
  });

  return {
    success: true,
    detectedPets,
    statistics,
    summary: `Found ${statistics.listingsWithPets} listings with pets out of ${statistics.totalListings} total listings`
  };
}

/**
 * Check if a single listing contains pet-related keywords
 * @param {Object} listing - A single listing object
 * @returns {Object} Detection result with found status, pets, confidence, and matched text
 */
function checkForPets(listing) {
  const text = `${listing.title || ''} ${listing.description || ''}`.toLowerCase();
  const foundPets = [];
  const matchedTexts = [];
  let confidence = 0;

  petKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}s?\\b`, 'gi');
    const matches = text.match(regex);
    
    if (matches) {
      if (!foundPets.includes(keyword)) {
        foundPets.push(keyword);
      }
      matchedTexts.push(...matches);
      confidence += matches.length * 0.1; // Increase confidence per match
    }
  });

  // Cap confidence at 100%
  confidence = Math.min(confidence, 100);

  return {
    found: foundPets.length > 0,
    pets: foundPets,
    confidence: Math.round(confidence),
    matchedText: [...new Set(matchedTexts)] // Remove duplicates
  };
}

/**
 * Filter listings to show only those containing pets
 * @param {Array} listings - Array of listing objects
 * @returns {Array} Filtered listings containing pets
 */
function filterPetListings(listings) {
  return listings.filter(listing => checkForPets(listing).found);
}

/**
 * Generate a report of pet listings
 * @param {Array} listings - Array of listing objects
 * @returns {String} Formatted report
 */
function generateReport(listings) {
  const results = detectPetsInListings(listings);
  
  let report = '=== FARMERS MARKET PET DETECTION REPORT ===\n\n';
  report += `${results.summary}\n`;
  report += `Total Vendors with Pets: ${results.statistics.vendors.length}\n\n`;
  
  report += '--- PET TYPES FOUND ---\n';
  Object.entries(results.statistics.petTypes).forEach(([pet, count]) => {
    report += `${pet.charAt(0).toUpperCase() + pet.slice(1)}: ${count}\n`;
  });
  
  report += '\n--- DETAILED LISTINGS ---\n';
  results.detectedPets.forEach((pet, index) => {
    report += `\n[${index + 1}] ${pet.vendor}\n`;
    report += `    Title: ${pet.title}\n`;
    report += `    Pets: ${pet.detectedPets.join(', ')}\n`;
    report += `    Confidence: ${pet.confidence}%\n`;
  });

  return report;
}

// Example usage
const sampleListings = [
  {
    vendor: 'Happy Farm Co.',
    title: 'Fresh Vegetables & Rabbits',
    description: 'Organic vegetables and cute rabbits for sale'
  },
  {
    vendor: 'Sunny Garden',
    title: 'Seasonal Produce',
    description: 'Fresh tomatoes, lettuce, and herbs from our garden'
  },
  {
    vendor: 'Pet-Friendly Farm',
    title: 'Farm Fresh with Dogs',
    description: 'We sell eggs and have two friendly dogs at our stand'
  },
  {
    vendor: 'Urban Farm',
    title: 'Organic Cats and Herbs',
    description: 'Herbs and our farm cats available for adoption'
  }
];

// Run detection
const results = detectPetsInListings(sampleListings);
console.log(results);
console.log('\n' + generateReport(sampleListings));

// Export functions for use in other modules
module.exports = {
  detectPetsInListings,
  checkForPets,
  filterPetListings,
  generateReport
};
