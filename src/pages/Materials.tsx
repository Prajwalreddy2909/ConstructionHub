import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN'; // Replace with actual token

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4
  });

  const [showModal, setShowModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    status: 'In Stock',
    quantity: ''
  });

  // Load materials from localStorage ONCE when component mounts
  useEffect(() => {
    const savedMaterials = JSON.parse(localStorage.getItem('materials'));
    if (savedMaterials && Array.isArray(savedMaterials)) {
      setMaterials(savedMaterials);
    } else {
      // First time only: set default materials
      const defaultMaterials = [
        { name: 'Cement', status: 'In Stock', quantity: 200 },
        { name: 'Steel', status: 'Out of Stock', quantity: 0 },
        { name: 'Bricks', status: 'In Stock', quantity: 500 },
        { name: 'Sand', status: 'In Stock', quantity: 300 }
      ];
      setMaterials(defaultMaterials);
      localStorage.setItem('materials', JSON.stringify(defaultMaterials));
    }
  }, []);

  // Save to localStorage every time `materials` changes
  useEffect(() => {
    if (materials.length > 0) {
      localStorage.setItem('materials', JSON.stringify(materials));
    }
  }, [materials]);

  const handleAddMaterial = () => {
    if (!newMaterial.name || newMaterial.quantity === '') return;

    const updated = [...materials, newMaterial];
    setMaterials(updated);
    setNewMaterial({ name: '', status: 'In Stock', quantity: '' });
    setShowModal(false);
  };

  const handleStatusToggle = (index) => {
    const updated = [...materials];
    updated[index].status = updated[index].status === 'In Stock' ? 'Out of Stock' : 'In Stock';
    setMaterials(updated);
  };

  const handleQuantityChange = (index, quantity) => {
    const updated = [...materials];
    updated[index].quantity = quantity;
    setMaterials(updated);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Materials Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-netflix-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Add Material
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="bg-netflix-dark p-6 rounded-lg relative shadow-2xl"
>
  <h3 className="text-white text-xl font-bold mb-4 tracking-wide animate-pulse">Material Stock Map</h3>

  <motion.div
    className="relative rounded-md overflow-hidden group h-[500px] w-full"
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 1, ease: "easeInOut" }}
  >
    {/* Full India Map Display with glow on hover */}
    <motion.img
      src="https://i.pinimg.com/736x/5f/cb/5d/5fcb5dedf21bf52830654a73b81c75ab.jpg"
      alt="India Map"
      className="w-full h-full object-contain rounded-md shadow-md transition-transform duration-1000"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, rotate: 0.2, filter: 'brightness(1.1)' }}
    />

    {/* Material Markers with Fancy Animations */}
    {[
      { top: '20%', left: '35%', label: 'Cement', color: 'green', units: '200 units', delay: 0.3 },
      { top: '40%', left: '60%', label: 'Bricks', color: 'yellow', units: '500 units', delay: 0.5 },
      { top: '60%', left: '45%', label: 'Sand', color: 'blue', units: '300 units', delay: 0.7 },
      { top: '30%', left: '50%', label: 'Steel', color: 'red', units: 'Out of Stock', delay: 0.9 },
    ].map((item, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: item.delay, type: 'spring', stiffness: 100, damping: 8 }}
        className="absolute"
        style={{ top: item.top, left: item.left }}
      >
        <motion.div
          whileHover={{ scale: 1.2, y: -4, rotate: 2 }}
          whileTap={{ scale: 1.3 }}
          className="relative group/marker cursor-pointer flex flex-col items-center"
        >
          {/* Glowing Ping Effect */}
          <div
            className={`absolute inset-0 bg-${item.color}-500 opacity-70 rounded-full blur-xl animate-ping`}
          />
          {/* Floating Badge */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`relative bg-${item.color}-600 text-white text-xs px-3 py-1 rounded shadow-lg z-10 backdrop-blur-sm transition-all duration-300`}
          >
            {item.label}<br />{item.units}
          </motion.div>
        </motion.div>
      </motion.div>
    ))}
  </motion.div>
</motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-netflix-dark p-6 rounded-lg"
          >
            <h3 className="text-white text-lg font-semibold mb-4">Material List</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {materials.map((material, index) => (
                <div
                  key={index}
                  className="bg-netflix-gray p-4 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div>
                    <h4 className="text-white font-medium">{material.name}</h4>
                    <p className="text-gray-400 text-sm">Status: {material.status}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Quantity:{' '}
                      <input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="ml-2 bg-transparent text-white border-b border-white focus:outline-none w-20"
                      />
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center space-x-4">
                    <span
                      className={`${
                        material.status === 'In Stock' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      ●
                    </span>
                    <button
                      onClick={() => handleStatusToggle(index)}
                      className="text-sm text-netflix-red hover:text-red-700 transition"
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Add Material Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-netflix-gray p-6 rounded-md w-full max-w-md">
              <h3 className="text-white text-lg font-semibold mb-4">Add Material</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Material Name"
                  value={newMaterial.name}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, name: e.target.value })
                  }
                  className="w-full p-2 rounded bg-netflix-dark text-white"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newMaterial.quantity}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, quantity: e.target.value })
                  }
                  className="w-full p-2 rounded bg-netflix-dark text-white"
                />
                <select
                  value={newMaterial.status}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, status: e.target.value })
                  }
                  className="w-full p-2 rounded bg-netflix-dark text-white"
                >
                  <option>In Stock</option>
                  <option>Out of Stock</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMaterial}
                    className="bg-netflix-red text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Materials;