import React, { useState, useEffect } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CitySelector = ({ onLocationSelect, currentLocation, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  // Comprehensive list of Indian cities with coordinates
  const indianCities = [
    // Major Metropolitan Cities
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    
    // State Capitals
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
    { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973 },
    { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 },
    { name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296 },
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
    { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
    { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
    { name: 'Gandhinagar', state: 'Gujarat', lat: 23.2156, lng: 72.6369 },
    { name: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278 },
    { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
    { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
    { name: 'Imphal', state: 'Manipur', lat: 24.8170, lng: 93.9368 },
    { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933 },
    { name: 'Aizawl', state: 'Mizoram', lat: 23.1645, lng: 92.9376 },
    { name: 'Kohima', state: 'Nagaland', lat: 25.6751, lng: 94.1086 },
    { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lng: 93.6053 },
    { name: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868 },
    { name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lng: 88.6065 },
    
    // Major Cities by State
    // Maharashtra
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
    { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
    { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
    { name: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 },
    { name: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064 },
    { name: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lng: 73.0297 },
    { name: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lng: 74.2433 },
    { name: 'Sangli', state: 'Maharashtra', lat: 16.8524, lng: 74.5815 },
    { name: 'Akola', state: 'Maharashtra', lat: 20.7002, lng: 77.0082 },
    { name: 'Latur', state: 'Maharashtra', lat: 18.4088, lng: 76.5604 },
    
    // Gujarat
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
    { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
    { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022 },
    { name: 'Bhavnagar', state: 'Gujarat', lat: 21.7645, lng: 72.1519 },
    { name: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lng: 70.0577 },
    { name: 'Junagadh', state: 'Gujarat', lat: 21.5222, lng: 70.4579 },
    { name: 'Anand', state: 'Gujarat', lat: 22.5645, lng: 72.9289 },
    
    // Karnataka
    { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
    { name: 'Hubli', state: 'Karnataka', lat: 15.3647, lng: 75.1240 },
    { name: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
    { name: 'Belgaum', state: 'Karnataka', lat: 15.8497, lng: 74.4977 },
    { name: 'Gulbarga', state: 'Karnataka', lat: 17.3297, lng: 76.8343 },
    { name: 'Davangere', state: 'Karnataka', lat: 14.4644, lng: 75.9218 },
    { name: 'Bellary', state: 'Karnataka', lat: 15.1394, lng: 76.9214 },
    
    // Tamil Nadu
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
    { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
    { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047 },
    { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
    { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lng: 77.7567 },
    { name: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lng: 77.7172 },
    { name: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325 },
    { name: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642, lng: 78.1348 },
    { name: 'Dindigul', state: 'Tamil Nadu', lat: 10.3673, lng: 77.9803 },
    
    // Uttar Pradesh
    { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 },
    { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
    { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
    { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
    { name: 'Allahabad', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463 },
    { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304 },
    { name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880 },
    { name: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lng: 78.7733 },
    { name: 'Saharanpur', state: 'Uttar Pradesh', lat: 29.9680, lng: 77.5552 },
    { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732 },
    { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
    
    // West Bengal - Complete Coverage
    { name: 'Howrah', state: 'West Bengal', lat: 22.5958, lng: 88.2636 },
    { name: 'Durgapur', state: 'West Bengal', lat: 23.5204, lng: 87.3119 },
    { name: 'Asansol', state: 'West Bengal', lat: 23.6739, lng: 86.9524 },
    { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953 },
    { name: 'Malda', state: 'West Bengal', lat: 25.0961, lng: 88.1435 },
    { name: 'Baharampur', state: 'West Bengal', lat: 24.1041, lng: 88.2515 },
    { name: 'Habra', state: 'West Bengal', lat: 22.8335, lng: 88.6324 },
    { name: 'Kharagpur', state: 'West Bengal', lat: 22.3460, lng: 87.2320 },
    { name: 'Shantipur', state: 'West Bengal', lat: 23.2520, lng: 88.4340 },
    { name: 'Dankuni', state: 'West Bengal', lat: 22.6761, lng: 88.2787 },
    { name: 'Dhulian', state: 'West Bengal', lat: 24.6833, lng: 87.9500 },
    { name: 'Ranaghat', state: 'West Bengal', lat: 23.1833, lng: 88.5833 },
    { name: 'Haldia', state: 'West Bengal', lat: 22.0667, lng: 88.0667 },
    { name: 'Raiganj', state: 'West Bengal', lat: 25.6147, lng: 88.1234 },
    { name: 'Krishnanagar', state: 'West Bengal', lat: 23.4017, lng: 88.5069 },
    { name: 'Nabadwip', state: 'West Bengal', lat: 23.4086, lng: 88.3686 },
    { name: 'Medinipur', state: 'West Bengal', lat: 22.4248, lng: 87.3248 },
    { name: 'Jalpaiguri', state: 'West Bengal', lat: 26.5463, lng: 88.7198 },
    { name: 'Balurghat', state: 'West Bengal', lat: 25.2167, lng: 89.7500 },
    { name: 'Basirhat', state: 'West Bengal', lat: 22.6573, lng: 88.8946 },
    { name: 'Bankura', state: 'West Bengal', lat: 23.2324, lng: 87.0699 },
    { name: 'Chakdaha', state: 'West Bengal', lat: 23.0833, lng: 88.5167 },
    { name: 'Darjeeling', state: 'West Bengal', lat: 27.0360, lng: 88.2627 },
    { name: 'Alipurduar', state: 'West Bengal', lat: 26.4917, lng: 89.5264 },
    { name: 'Purulia', state: 'West Bengal', lat: 23.3424, lng: 86.3616 },
    { name: 'Jangipur', state: 'West Bengal', lat: 24.4667, lng: 88.0833 },
    { name: 'Bolpur', state: 'West Bengal', lat: 23.6667, lng: 87.7167 },
    { name: 'Bangaon', state: 'West Bengal', lat: 23.0667, lng: 88.8333 },
    { name: 'Cooch Behar', state: 'West Bengal', lat: 26.3244, lng: 89.4492 },
    { name: 'Alipore', state: 'West Bengal', lat: 22.5333, lng: 88.3333 },
    { name: 'Serampore', state: 'West Bengal', lat: 22.7500, lng: 88.3333 },
    { name: 'Chandannagar', state: 'West Bengal', lat: 22.8667, lng: 88.3667 },
    { name: 'Barrackpore', state: 'West Bengal', lat: 22.7667, lng: 88.3667 },
    { name: 'Chinsurah', state: 'West Bengal', lat: 22.9000, lng: 88.3833 },
    { name: 'Midnapore', state: 'West Bengal', lat: 22.4248, lng: 87.3248 },
    { name: 'Berhampore', state: 'West Bengal', lat: 24.1041, lng: 88.2515 },
    { name: 'Tamluk', state: 'West Bengal', lat: 22.3000, lng: 87.9167 },
    { name: 'Barasat', state: 'West Bengal', lat: 22.7167, lng: 88.4833 },
    { name: 'Contai', state: 'West Bengal', lat: 21.7833, lng: 87.7500 },
    { name: 'Raghunathganj', state: 'West Bengal', lat: 24.4167, lng: 88.1167 },
    { name: 'Suri', state: 'West Bengal', lat: 23.9167, lng: 87.5333 },
    { name: 'Jhargram', state: 'West Bengal', lat: 22.4500, lng: 86.9833 },
    { name: 'Murshidabad', state: 'West Bengal', lat: 24.1833, lng: 88.2667 },
    { name: 'Bishnupur', state: 'West Bengal', lat: 23.0833, lng: 87.3167 },
    { name: 'Arambagh', state: 'West Bengal', lat: 22.8833, lng: 87.7833 },
    { name: 'Tarakeswar', state: 'West Bengal', lat: 22.8833, lng: 88.0167 },
    { name: 'Raniganj', state: 'West Bengal', lat: 23.6167, lng: 87.1333 },
    { name: 'Pandua', state: 'West Bengal', lat: 23.0667, lng: 88.2833 },
    { name: 'Raghunathpur', state: 'West Bengal', lat: 23.5333, lng: 86.6667 },
    { name: 'Domkal', state: 'West Bengal', lat: 24.1500, lng: 88.0333 },
    { name: 'Madhyamgram', state: 'West Bengal', lat: 22.7000, lng: 88.4333 },
    { name: 'Baduria', state: 'West Bengal', lat: 22.7333, lng: 88.7833 },
    { name: 'Jaynagar Majilpur', state: 'West Bengal', lat: 22.1833, lng: 88.4167 },
    { name: 'Halisahar', state: 'West Bengal', lat: 22.9500, lng: 88.4167 },
    { name: 'Kamarhati', state: 'West Bengal', lat: 22.6667, lng: 88.3667 },
    { name: 'Panihati', state: 'West Bengal', lat: 22.6833, lng: 88.3833 },
    { name: 'Bhatpara', state: 'West Bengal', lat: 22.8667, lng: 88.4167 },
    { name: 'Naihati', state: 'West Bengal', lat: 22.9000, lng: 88.4167 },
    { name: 'Titagarh', state: 'West Bengal', lat: 22.7333, lng: 88.3667 },
    { name: 'Uttarpara', state: 'West Bengal', lat: 22.6833, lng: 88.3500 },
    { name: 'Rishra', state: 'West Bengal', lat: 22.7167, lng: 88.3500 },
    { name: 'Konnagar', state: 'West Bengal', lat: 22.7000, lng: 88.3333 },
    { name: 'Baidyabati', state: 'West Bengal', lat: 22.7833, lng: 88.3167 },
    { name: 'Kanchrapara', state: 'West Bengal', lat: 22.9667, lng: 88.4333 },
    { name: 'Gayeshpur', state: 'West Bengal', lat: 22.9833, lng: 88.5167 },
    { name: 'Kalyani', state: 'West Bengal', lat: 22.9833, lng: 88.4833 },
    { name: 'Santipur', state: 'West Bengal', lat: 23.2520, lng: 88.4340 },
    { name: 'Tehatta', state: 'West Bengal', lat: 23.6000, lng: 88.4667 },
    { name: 'Palashi', state: 'West Bengal', lat: 23.6000, lng: 88.2500 },
    { name: 'Mayurbhanj', state: 'West Bengal', lat: 23.3167, lng: 88.2833 },
    { name: 'Memari', state: 'West Bengal', lat: 23.2000, lng: 88.1167 },
    { name: 'Panskura', state: 'West Bengal', lat: 22.4000, lng: 87.6667 },
    { name: 'Egra', state: 'West Bengal', lat: 21.9000, lng: 87.5333 },
    { name: 'Rampurhat', state: 'West Bengal', lat: 24.1667, lng: 87.7833 },
    { name: 'Sainthia', state: 'West Bengal', lat: 23.9500, lng: 87.6667 },
    { name: 'Dubrajpur', state: 'West Bengal', lat: 23.7833, lng: 87.3833 },
    { name: 'Mayurbhanj', state: 'West Bengal', lat: 23.3167, lng: 88.2833 },
    { name: 'Farakka', state: 'West Bengal', lat: 24.8167, lng: 87.9000 },
    { name: 'Lalgola', state: 'West Bengal', lat: 24.4167, lng: 88.2500 },
    { name: 'Bhagawangola', state: 'West Bengal', lat: 24.2667, lng: 88.0333 },
    { name: 'Mayurbhanj', state: 'West Bengal', lat: 23.3167, lng: 88.2833 },
    
    // Rajasthan
    { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
    { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648 },
    { name: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119 },
    { name: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399 },
    { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
    { name: 'Bharatpur', state: 'Rajasthan', lat: 27.2152, lng: 77.4909 },
    
    // Madhya Pradesh
    { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864 },
    { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
    { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885 },
    { name: 'Sagar', state: 'Madhya Pradesh', lat: 23.8388, lng: 78.7378 },
    
    // Andhra Pradesh & Telangana
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
    { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
    { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365 },
    { name: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865 },
    { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373 },
    { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192 },
    { name: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941 },
    { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lng: 78.0941 },
    
    // Punjab
    { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
    { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
    { name: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
    { name: 'Patiala', state: 'Punjab', lat: 30.3398, lng: 76.3869 },
    { name: 'Bathinda', state: 'Punjab', lat: 30.2110, lng: 74.9455 },
    
    // Haryana
    { name: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
    { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
    { name: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635 },
    { name: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767 },
    { name: 'Yamunanagar', state: 'Haryana', lat: 30.1290, lng: 77.2674 },
    
    // Kerala
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
    { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lng: 75.7804 },
    { name: 'Thrissur', state: 'Kerala', lat: 10.5276, lng: 76.2144 },
    { name: 'Kollam', state: 'Kerala', lat: 8.8932, lng: 76.6141 },
    { name: 'Kannur', state: 'Kerala', lat: 11.8745, lng: 75.3704 },
    
    // Odisha
    { name: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8828 },
    { name: 'Rourkela', state: 'Odisha', lat: 22.2604, lng: 84.8536 },
    { name: 'Berhampur', state: 'Odisha', lat: 19.3149, lng: 84.7941 },
    
    // Jharkhand
    { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304 },
    { name: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lng: 86.2029 },
    { name: 'Bokaro', state: 'Jharkhand', lat: 23.6693, lng: 86.1511 },
    
    // Assam
    { name: 'Dibrugarh', state: 'Assam', lat: 27.4728, lng: 94.9120 },
    { name: 'Silchar', state: 'Assam', lat: 24.8333, lng: 92.7789 },
    { name: 'Jorhat', state: 'Assam', lat: 26.7509, lng: 94.2037 },
    
    // Other Important Cities
    { name: 'Jammu', state: 'Jammu and Kashmir', lat: 32.7266, lng: 74.8570 },
    { name: 'Leh', state: 'Ladakh', lat: 34.1526, lng: 77.5771 },
    { name: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lng: 79.8083 },
    { name: 'Port Blair', state: 'Andaman and Nicobar Islands', lat: 11.6234, lng: 92.7265 },
    { name: 'Daman', state: 'Daman and Diu', lat: 20.4283, lng: 72.8397 },
    { name: 'Silvassa', state: 'Dadra and Nagar Haveli', lat: 20.2738, lng: 73.0140 }
  ];

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCities(indianCities);
    } else {
      const filtered = indianCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchTerm]);

  const handleCitySelect = (city) => {
    onLocationSelect({
      lat: city.lat,
      lng: city.lng,
      name: city.name,
      state: city.state
    });
    onClose();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location',
            state: ''
          };
          onLocationSelect(pos);
          onClose();
        },
        () => {
          alert('Unable to get your current location');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Select Location</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Current Location Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={getCurrentLocation}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MapPinIcon className="h-5 w-5" />
            <span className="font-medium">Use Current Location</span>
          </button>
        </div>

        {/* Cities List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredCities.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.state}</div>
                    </div>
                    {currentLocation && 
                     currentLocation.lat === city.lat && 
                     currentLocation.lng === city.lng && (
                      <div className="text-blue-600">
                        <MapPinIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No cities found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitySelector;
