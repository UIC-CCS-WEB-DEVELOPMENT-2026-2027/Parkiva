// Researched names/locations only. Demo fields are never evidence of real availability or access.
export const retiredParkingIds = ['sample-courtyard', 'demo-arcade', 'example-lane', 'demo-square']
const source = (label, url) => ({ label, url })
const listings = [
  {
    id: 'davao-aldevinco-parking', name: 'Aldevinco Pay Parking',
    location: 'Former Aldevinco site, C.M. Recto Street corner Roxas Avenue, Davao City',
    category: 'Dedicated pay parking',
    mapsQuery: 'Aldevinco Pay Parking Roxas Avenue Davao City',
    description: 'Alsons Dev identifies an operating paid parking facility at the former Aldevinco site, alongside Roxas Food Trucks.',
    sources: [
      source('Alsons Dev: operating parking facility (August 2026)', 'https://alsonsdev.com/alsons-dev-brings-new-energy-to-aldevinco-site-as-redevelopment-progresses/'),
      source('Alsons Dev: site location', 'https://alsonsdev.com/alsons-dev-to-redevelop-aldevinco-to-support-davaos-growing-urban-landscape/'),
    ],
  },
  {
    id: 'davao-airport-parking', name: 'Francisco Bangoy International Airport Parking',
    location: 'Passenger terminal frontage, Airport Road, Sasa, Davao City',
    category: 'Airport car park',
    mapsQuery: 'Francisco Bangoy International Airport Parking Airport Road Davao City',
    description: 'The government airport project memorandum identifies a passenger car park in front of the terminal. This is a venue car park, not a Parkiva partner.',
    sources: [
      source('Philippine PPP Center: airport car park (2017 memorandum)', 'https://ppp.gov.ph/wp-content/uploads/2017/04/Project-Info-Memorandum-Davao-20170224.pdf'),
      source('Airport parking directory: Airport Road location', 'https://davaoairport.net/davao-airport-parking/'),
    ],
  },
  {
    id: 'davao-ddh-steel-carpark', name: 'Davao Doctors Hospital Steel Carpark',
    location: 'Malvar Street, Davao Doctors Hospital compound, Davao City',
    category: 'Hospital parking facility',
    mapsQuery: 'Davao Doctors Hospital Steel Carpark Malvar Street Davao City',
    description: 'The hospital identifies its Steel Carpark in its published facility plans. Hospital access policies apply; general public access is not guaranteed by this listing.',
    sources: [
      source('Davao Doctors Hospital: Steel Carpark facility plans', 'https://ddh.com.ph/services-and-centers/zoning/'),
      source('SunStar: Malvar Street location (historical report)', 'https://www.sunstar.com.ph/davao/local-news/ddh-carpark-closed-after-vehicle-fell'),
    ],
  },
  {
    id: 'davao-sm-city-parking', name: 'SM City Davao Parking',
    location: 'Quimpo Boulevard corner Tulip Drive, Ecoland, Matina, Davao City',
    category: 'Mall parking',
    mapsQuery: 'SM City Davao Parking Quimpo Boulevard Davao City',
    description: 'Parking at SM City Davao is documented in SM Prime disclosures. This listing covers the mall premises, without claiming a particular entrance or parking level is currently open.',
    sources: [
      source('SM Prime disclosure: SM City Davao location and parking', 'https://www.pds.com.ph/wp-content/uploads/2026/04/SMPH-Debt-Securities-Program-OC-as-of-27-February-2020-clean.pdf'),
      source('DENR-EMB: SM City Davao site description', 'https://r11.emb.gov.ph/wp-content/uploads/2023/09/SM-City-Davao-Executive-Summary-for-Public-Infor-EN.pdf'),
    ],
  },
  {
    id: 'davao-sm-lanang-parking', name: 'SM Lanang Premier Parking',
    location: 'J.P. Laurel Avenue, Barangay San Antonio, Lanang, Davao City',
    category: 'Mall parking',
    mapsQuery: 'SM Lanang Premier Parking JP Laurel Avenue Davao City',
    description: 'SMX Davao describes basement and open parking within the SM Lanang Premier complex. No real parking allocation or reservation service is provided here.',
    sources: [
      source('SMX Davao: complex address and parking facilities', 'https://www.smxconventioncenter.com/smx-davao/'),
      source('DENR-EMB: SM Lanang site location (2025)', 'https://r11.emb.gov.ph/wp-content/uploads/2025/09/SM-Lanang-Premier-Updated-Project-Description-09162025-Report-01.pdf'),
    ],
  },
  {
    id: 'davao-abreeza-parking', name: 'Ayala Malls Abreeza Parking',
    location: 'J.P. Laurel Avenue, Bajada, Davao City',
    category: 'Mall parking',
    mapsQuery: 'Abreeza Mall Parking JP Laurel Avenue Davao City',
    description: 'Abreeza mall parking is documented in local reporting; Ayala Malls identifies the premises on J.P. Laurel Avenue. Published historical services are not promises of current operations.',
    sources: [
      source('Ayala Malls: Abreeza address', 'https://www.ayalamalls.com/explore/malls/store/AYALA-ABREEZA-21782565'),
      source('Edge Davao: Abreeza basement parking (historical report)', 'https://edgedavao.net/indulge-lifestyle/2013/09/abreezas-first-ever-mall-valet-parking-service-in-mindanao/'),
      source('Davao Promos: mall parking report (October 2026)', 'https://davaopromos.com/2026/10/16/mall-parking-rates-in-davao-city-as-of-october-2026/'),
    ],
  },
  {
    id: 'davao-gmall-parking', name: 'Gaisano Mall of Davao Parking',
    location: 'J.P. Laurel Avenue, Bajada, Davao City',
    category: 'Mall parking',
    mapsQuery: 'Gaisano Mall of Davao Parking JP Laurel Avenue Davao City',
    description: 'Local reporting identifies customer parking at Gaisano Mall of Davao on J.P. Laurel Avenue. This listing does not imply access to any proposed expansion area.',
    sources: [
      source('Edge Davao: existing mall parking and address (2025)', 'https://edgedavao.net/latest-news/2025/09/councilor-calls-on-davao-mall-to-reconsider-parking-policy/'),
      source('Waze: Gaisano Mall of Davao location and customer parking', 'https://www.waze.com/live-map/directions/gaisano-mall-of-davao-j.p.-laurel-ave-davao-city?to=place.w.82313287.823198404.903005'),
    ],
  },
  {
    id: 'davao-nccc-buhangin-parking', name: 'NCCC Mall Buhangin Parking',
    location: 'Tigatto Road, Buhangin, Davao City',
    category: 'Mall parking',
    mapsQuery: 'NCCC Mall Buhangin Parking Tigatto Road Davao City',
    description: 'NCCC documents basement parking at its Buhangin mall. The address is corroborated by a retailer directory; availability and access restrictions must be checked directly.',
    sources: [
      source('NCCC: Buhangin mall and basement parking', 'https://nccc.com.ph/about/company-profile/'),
      source('NCCC Cinemas: Buhangin Tigatto Road address', 'https://cinemas.nccc.com.ph/contact-us'),
    ],
  },
]

export const parkingAreas = listings.map((listing, index) => ({
  ...listing,
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.mapsQuery)}`,
  researchedOn: '2026-10-26',
  photoStatus: 'placeholder',
  // These options support the frontend exercise only, not actual vehicle admission policies.
  vehicles: index === 1 ? ['Car'] : index === 2 ? ['Motorcycle'] : ['Car', 'Motorcycle'],
  availability: index === 1 ? 'Limited' : index === 2 ? 'Full' : 'Available',
  access: 'Entrance routing and current access restrictions are not verified. Open the location in Maps and follow on-site signs; confirm access with the facility.',
}))
