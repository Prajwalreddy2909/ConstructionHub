import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserCheck, UserX, MinusCircle, Edit3, Save, XCircle } from 'lucide-react'; // Added Edit3, Save, XCircle
import DashboardLayout from '../components/DashboardLayout';

// Interface for Worker data remains the same
interface Worker {
  id: number;
  name: string;
  role: string;
  status: 'available' | 'assigned' | 'on-leave';
  project: string | null; // Project name
}

// Interface for Project data (only need name for dropdown)
interface Project {
  id: number;
  name: string;
  // ... other project fields aren't needed here
}

function Labour() {
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const savedWorkers = localStorage.getItem('workers');
    // Added basic validation
    try {
      const parsed = savedWorkers ? JSON.parse(savedWorkers) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // State for projects (to populate dropdown)
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);

  // State for adding a new worker
  const [newWorker, setNewWorker] = useState({
    name: '',
    role: '',
    status: 'available',
    project: '', // Keep using string here, handle null later
  });

  // --- State for Editing ---
  const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Worker | null>(null);
  // --- End Editing State ---

  // Fetch projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects) as Project[];
        if (Array.isArray(parsedProjects)) {
          setProjects(parsedProjects);
          setProjectNames(parsedProjects.map(p => p.name));
        } else {
          setProjects([]);
          setProjectNames([]);
        }
      } catch (error) {
        console.error("Failed to parse projects from localStorage:", error);
        setProjects([]);
        setProjectNames([]);
      }
    }
  }, []); // Runs once on mount

  // Save workers to localStorage whenever workers state changes
  useEffect(() => {
     // Avoid saving empty array initially if localStorage was empty/invalid
     if (workers.length > 0 || localStorage.getItem('workers') !== null) {
       localStorage.setItem('workers', JSON.stringify(workers));
     }
  }, [workers]);

  // Count workers by status
  const totalWorkers = workers.length;
  const availableWorkers = workers.filter(worker => worker.status === 'available').length;
  const assignedWorkers = workers.filter(worker => worker.status === 'assigned').length;
  const onLeaveWorkers = workers.filter(worker => worker.status === 'on-leave').length;

  // --- Add new worker ---
  const addWorker = () => {
    if (!newWorker.name.trim() || !newWorker.role.trim()) {
      alert('Please enter both Name and Role.');
      return;
    }

    // Determine project value: null if empty string or default option, else the selected name
    const projectValue = newWorker.project && newWorker.project !== "-- Select Project --" ? newWorker.project.trim() : null;
    // Automatically set status to 'assigned' if a project is selected, else 'available'
    const statusValue = projectValue ? 'assigned' : 'available';


    const newEntry: Worker = {
      id: Date.now(),
      name: newWorker.name.trim(),
      role: newWorker.role.trim(),
      // status: newWorker.status as Worker['status'], // Status is now derived
      status: statusValue,
      // project: newWorker.project.trim() || null, // Project handling updated
      project: projectValue,
    };

    setWorkers(prevWorkers => [...prevWorkers, newEntry]);
    // Reset form including project dropdown
    setNewWorker({ name: '', role: '', status: 'available', project: '' });
  };

  // --- Update worker status (kept for potential direct status change if needed) ---
  const updateWorkerStatus = (id: number, newStatus: Worker['status']) => {
    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.id === id ? { ...worker, status: newStatus } : worker
      )
    );
  };

  // --- Delete Worker ---
  const deleteWorker = (id: number) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
        setWorkers(prevWorkers => prevWorkers.filter(worker => worker.id !== id));
        // Optional: Clear editing state if the deleted worker was being edited
        if (editingWorkerId === id) {
            setEditingWorkerId(null);
            setEditFormData(null);
        }
    }
  };


  // --- Edit Worker Logic ---
  const handleEditClick = (worker: Worker) => {
    setEditingWorkerId(worker.id);
    // Pre-fill edit form data with current worker details
    setEditFormData({ ...worker });
  };

  const handleCancelEdit = () => {
    setEditingWorkerId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return; // Should not happen if button is visible

    // Basic validation for edited fields
    if (!editFormData.name.trim() || !editFormData.role.trim()) {
      alert('Worker Name and Role cannot be empty.');
      return;
    }

     // Determine project value: null if empty string or default option, else the selected name
    const projectValue = editFormData.project && editFormData.project !== "-- Select Project --" ? editFormData.project.trim() : null;
    // Automatically update status based on project assignment during save
    const statusValue = projectValue ? 'assigned' : (editFormData.status === 'assigned' ? 'available' : editFormData.status); // Keep 'on-leave' if it was set

    const updatedWorker: Worker = {
      ...editFormData,
      name: editFormData.name.trim(),
      role: editFormData.role.trim(),
      project: projectValue,
      status: statusValue,
    };


    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.id === editingWorkerId ? updatedWorker : worker
      )
    );

    // Exit editing mode
    setEditingWorkerId(null);
    setEditFormData(null);
  };

  // Handle changes in the edit form fields
  const handleEditFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editFormData) return;
    const { name, value } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };
  // --- End Edit Worker Logic ---


  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Labour Management</h2>

        {/* Top Count Block (remains the same) */}
        <motion.div /* ... */ >
             {/* ... count divs ... */}
        </motion.div>

        {/* Add Worker Section */}
        <motion.div
          className="bg-netflix-dark p-6 rounded-lg space-y-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-white">Add Worker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"> {/* Adjusted grid */}
            <input
              type="text"
              placeholder="Worker Name"
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              className="p-2 rounded bg-gray-800 text-white w-full"
            />
            <input
              type="text"
              placeholder="Worker Role"
              value={newWorker.role}
              onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
              className="p-2 rounded bg-gray-800 text-white w-full"
            />
            {/* Project Assignment Dropdown */}
            <select
              value={newWorker.project}
              onChange={(e) => setNewWorker({ ...newWorker, project: e.target.value })}
              className="p-2 rounded bg-gray-800 text-white w-full"
            >
              <option value="">-- Select Project --</option>
              {projectNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {/* Status dropdown removed - determined automatically */}
            {/*
            <select
              value={newWorker.status}
              onChange={(e) => setNewWorker({ ...newWorker, status: e.target.value as Worker['status'] })}
              className="p-2 rounded bg-gray-800 text-white w-full"
            >
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="on-leave">On Leave</option>
            </select>
             */}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-netflix-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 mt-4"
            onClick={addWorker}
          >
            <UserPlus size={20} />
            Add Worker
          </motion.button>
        </motion.div>

        {/* Worker List Section */}
        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Worker List</h3>

          {workers.length === 0 ? (
            <p className="text-white text-center">No workers available.</p>
          ) : (
            <ul className="space-y-3">
              {workers.map((worker) => (
                <li
                  key={worker.id}
                  className={`bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4 ${editingWorkerId === worker.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {editingWorkerId === worker.id && editFormData ? (
                    // --- Edit Mode ---
                    <>
                      <div className="flex-grow space-y-2">
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditFormChange}
                          className="p-2 rounded bg-gray-700 text-white w-full text-sm"
                          placeholder="Worker Name"
                        />
                        <input
                          type="text"
                          name="role"
                          value={editFormData.role}
                          onChange={handleEditFormChange}
                          className="p-2 rounded bg-gray-700 text-white w-full text-sm"
                          placeholder="Worker Role"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-center flex-shrink-0">
                         <select // Project Dropdown in Edit Mode
                          name="project"
                          value={editFormData.project || ''} // Handle null value for select
                          onChange={handleEditFormChange}
                          className="p-2 rounded bg-gray-700 text-white text-sm w-full sm:w-auto"
                        >
                           <option value="">-- No Project --</option>
                          {projectNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <select // Status Dropdown in Edit Mode (read-only if project assigned)
                          name="status"
                          value={editFormData.status}
                          onChange={handleEditFormChange}
                          // Disable if a project is selected, otherwise allow change
                          disabled={!!(editFormData.project && editFormData.project !== "")}
                          className={`p-2 rounded bg-gray-700 text-white text-sm w-full sm:w-auto ${!!(editFormData.project && editFormData.project !== "") ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          <option value="available">Available</option>
                          {/* <option value="assigned">Assigned</option> */} {/* Cannot manually set to assigned */}
                          <option value="on-leave">On Leave</option>
                        </select>
                        <div className="flex gap-2 mt-2 md:mt-0">
                            <button onClick={handleSaveEdit} className="p-2 text-green-400 hover:text-green-300"><Save size={18}/></button>
                            <button onClick={handleCancelEdit} className="p-2 text-gray-400 hover:text-gray-300"><XCircle size={18}/></button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // --- Display Mode ---
                    <>
                      <div className='flex-grow'>
                        <h4 className="text-white font-semibold">{worker.name}</h4>
                        <p className="text-gray-400 text-sm">Role: {worker.role}</p>
                        <p className="text-gray-400 text-sm">
                          Project: {worker.project ? worker.project : <span className="italic text-gray-500">None</span>}
                        </p>
                         <p className={`text-sm font-medium mt-1 ${
                            worker.status === 'available' ? 'text-green-400' :
                            worker.status === 'assigned' ? 'text-yellow-400' : 'text-red-400'
                         }`}>
                          Status: {worker.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} {/* Nicer formatting */}
                         </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 items-center">
                         {/* Edit Button */}
                        <button
                            onClick={() => handleEditClick(worker)}
                            className="p-2 text-blue-400 hover:text-blue-300"
                            title="Edit Worker"
                         >
                           <Edit3 size={18} />
                        </button>
                         {/* Delete Button */}
                        <button
                            onClick={() => deleteWorker(worker.id)}
                            className="p-2 text-red-400 hover:text-red-300"
                            title="Delete Worker"
                        >
                            <MinusCircle size={18} />
                        </button>
                        {/* Status Dropdown (might remove if status is fully automatic) */}
                        {/*
                        <select
                          value={worker.status}
                          onChange={(e) =>
                            updateWorkerStatus(worker.id, e.target.value as Worker["status"])
                          }
                          className="p-2 rounded bg-gray-700 text-white text-sm"
                        >
                          <option value="available">Available</option>
                          <option value="assigned">Assigned</option>
                          <option value="on-leave">On Leave</option>
                        </select>
                         */}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Labour;