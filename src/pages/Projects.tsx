import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, BarChart, Users, Plus, Settings, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

// Interface for Project data
interface Project {
  id: number;
  name: string;
  deadline: string;
  progress: number;
  sqFt: number;
  workers: number; // Used for calculation logic if needed
}

// Interface for Worker data (copied from Labour.tsx or shared type)
interface Worker {
  id: number;
  name: string;
  role: string;
  status: 'available' | 'assigned' | 'on-leave';
  project: string | null;
}

// Main Projects component
function Projects() {
  // State for projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('projects');
    // Added basic validation
    try {
       const parsed = savedProjects ? JSON.parse(savedProjects) : [];
       return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
  });

  // State for workers
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const savedWorkers = localStorage.getItem('workers');
     // Added basic validation
    if (savedWorkers) {
      try {
        const parsedWorkers = JSON.parse(savedWorkers) as Worker[];
        if (Array.isArray(parsedWorkers)) {
          return parsedWorkers; // Return parsed data if valid
        } else {
          console.error("Loaded workers data is not an array:", parsedWorkers);
          return []; // Return empty array if data is invalid
        }
      } catch (error) {
        console.error("Failed to parse workers from localStorage:", error);
        return []; // Return empty array on parsing error
      }
    }
    return []; // Return empty array if nothing in localStorage
  });

  // State for new project form visibility and data
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    deadline: '',
    sqFt: '',
  });

  // Fetch workers from localStorage on component mount
  useEffect(() => {
    const savedWorkers = localStorage.getItem('workers');
    if (savedWorkers) {
      try {
        const parsedWorkers = JSON.parse(savedWorkers) as Worker[];
        // Validate if it's an array before setting state
        if (Array.isArray(parsedWorkers)) {
          setWorkers(parsedWorkers);
        } else {
          console.error("Loaded workers data is not an array:", parsedWorkers);
          setWorkers([]); // Set to empty array if data is invalid
        }
      } catch (error) {
        console.error("Failed to parse workers from localStorage:", error);
        setWorkers([]); // Set to empty array on parsing error
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  // Save projects to localStorage whenever projects state changes
  useEffect(() => {
     // Avoid saving empty array initially if localStorage was empty/invalid
     if (projects.length > 0 || localStorage.getItem('projects') !== null) {
        localStorage.setItem('projects', JSON.stringify(projects));
     }
  }, [projects]);

  // Calculate required workers based on sqFt (example logic)
  const calculateWorkers = (sqFt: number) => {
    if (sqFt <= 0) return 0;
    return Math.max(1, Math.ceil(sqFt / 500)); // Example: 1 worker per 500 sq ft
  };

  // Add a new project
  const addProject = () => {
    const sqFtValue = parseInt(newProject.sqFt, 10);
    if (!newProject.name || !newProject.deadline || isNaN(sqFtValue) || sqFtValue <= 0) {
      alert('Please fill in all fields correctly (Name, Deadline, positive SqFt).');
      return;
    }

    // Check for duplicate project name (case-insensitive)
    if (projects.some(p => p.name.trim().toLowerCase() === newProject.name.trim().toLowerCase())) {
        alert(`A project named "${newProject.name.trim()}" already exists. Please use a unique name.`);
        return;
    }

    const newEntry: Project = {
      id: Date.now(),
      name: newProject.name.trim(),
      deadline: newProject.deadline,
      progress: 0,
      sqFt: sqFtValue,
      workers: calculateWorkers(sqFtValue),
    };

    setProjects([...projects, newEntry]);
    setNewProject({ name: '', deadline: '', sqFt: '' });
    setShowAddForm(false);
  };

  // Delete a project and unassign workers
  const deleteProject = (id: number, projectName: string) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"? This will also unassign workers.`)) {
      return;
    }

    // Filter out the project
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));

    // Unassign workers from the deleted project
    const updatedWorkers = workers.map(worker => {
        if (worker.project === projectName) {
            // Set status to 'available' and remove project assignment
            return { ...worker, project: null, status: 'available' as 'available' };
        }
        return worker;
    });
    setWorkers(updatedWorkers); // Update worker state
    // Persist worker changes (important!)
    localStorage.setItem('workers', JSON.stringify(updatedWorkers));
  };

  // Function to update project progress
  const updateProjectProgress = (id: number, change: number) => {
    setProjects(
      projects.map(project => {
        if (project.id === id) {
          const newProgress = Math.min(100, Math.max(0, project.progress + change)); // Ensure progress stays between 0 and 100
          return { ...project, progress: newProgress };
        }
        return project;
      })
    );
  };

  // Calculate required materials based on sqFt (example logic)
  const calculateMaterials = (sqFt: number) => {
    if (sqFt <= 0) return { cementBags: 0, bricks: 0, steelRods: 0 };
    // Basic estimation logic
    const cementBags = Math.ceil(sqFt * 0.5); // 0.5 bags per sq ft
    const bricks = Math.ceil(sqFt * 10); // 10 bricks per sq ft
    const steelRods = Math.ceil(sqFt * 0.1); // 0.1 rods per sq ft
    return { cementBags, bricks, steelRods };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Projects Overview</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-netflix-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            {showAddForm ? 'Cancel' : 'Add Project'}
          </motion.button>
        </div>

        {/* Add Project Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-netflix-dark p-6 rounded-lg space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">New Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
              <input
                type="date"
                placeholder="Deadline"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
              <input
                type="number"
                placeholder="Square Footage (sq ft)"
                value={newProject.sqFt}
                onChange={(e) => setNewProject({ ...newProject, sqFt: e.target.value })}
                className="p-2 rounded bg-gray-800 text-white w-full"
                min="1"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Briefcase size={20} />
              Confirm Add Project
            </motion.button>
          </motion.div>
        )}

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            // Calculate materials needed for this project
            const materials = calculateMaterials(project.sqFt);
            // Find workers assigned to this specific project
            const assignedWorkers = workers.filter(
              (worker) => worker.project === project.name && worker.status === 'assigned'
            );

            // Derive Status from Progress
            let currentStatus: string;
            let statusBgColor: string;
            if (project.progress === 0) {
              currentStatus = 'Not Started';
              statusBgColor = 'bg-gray-600';
            } else if (project.progress > 0 && project.progress < 100) {
              currentStatus = 'In Progress';
              statusBgColor = 'bg-yellow-600';
            } else { // progress === 100
              currentStatus = 'Completed';
              statusBgColor = 'bg-green-600';
            }

            return (
              <motion.div
                key={project.id}
                className="bg-netflix-dark p-6 rounded-lg shadow-lg text-white flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div> {/* Top section for details */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    {/* Use derived status and color */}
                    <span className={`text-xs px-2 py-1 rounded ${statusBgColor}`}>
                      {currentStatus}
                    </span>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <p><strong>ID:</strong> {project.id}</p>
                    <p><strong>Deadline:</strong> {project.deadline}</p>
                    <p><strong>Square Footage:</strong> {project.sqFt} sq ft</p>

                    {/* --- Unique Progress Bar --- */}
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">Progress</span>
                        <span className="text-sm font-medium text-gray-300">{project.progress}%</span>
                      </div>
                      {/* Outer bar container */}
                      <div className="w-full bg-gray-700 rounded-full h-3 dark:bg-gray-600 shadow-inner"> {/* Made slightly thicker (h-3) and added inner shadow */}
                        {/* Inner progress indicator */}
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out shadow-md shadow-pink-500/50" // Changed gradient, kept transition, added outer shadow
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* --- End Unique Progress Bar --- */}

                    {/* Progress Update Buttons - Pass the change amount */}
                     <div className="flex gap-2 mt-2">
                      <button onClick={() => updateProjectProgress(project.id, 10)} className="text-xs bg-blue-700 px-2 py-1 rounded hover:bg-blue-600 transition-colors">+</button>
                      <button onClick={() => updateProjectProgress(project.id, -10)} className="text-xs bg-red-700 px-2 py-1 rounded hover:bg-red-600 transition-colors">-</button>
                    </div>


                    {/* Estimated Materials */}
                    <p className="font-semibold mt-3">Estimated Materials:</p>
                    <p><strong>Cement Bags:</strong> {materials.cementBags}</p>
                    <p><strong>Bricks:</strong> {materials.bricks}</p>
                    <p><strong>Steel Rods:</strong> {materials.steelRods}</p>

                    {/* Display Assigned Workers */}
                    <p className="font-semibold mt-3">Workers Assigned:</p>
                    {assignedWorkers.length > 0 ? (
                      <ul className="list-disc list-inside ml-1">
                        {assignedWorkers.map(worker => (
                          <li key={worker.id}>{worker.name} ({worker.role})</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No workers currently assigned.</p>
                    )}

                  </div>
                </div>

                {/* Bottom section for actions */}
                <div className="mt-auto pt-4 border-t border-gray-700 flex justify-end items-center">
                   {/* Delete Button - Pass project name for worker update */}
                  <button
                    onClick={() => deleteProject(project.id, project.name)}
                    className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"
                  >
                     <Trash2 size={16} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Projects;