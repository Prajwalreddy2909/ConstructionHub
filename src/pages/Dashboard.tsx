import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Users, Box, XCircle, BarChart3 } from 'lucide-react';
import ProjectProgressChart from '../components/ProjectProgressChart'; // ✅ Import chart

interface Worker {
  id: number;
  name: string;
  role: string;
  status: 'available' | 'assigned' | 'on-leave';
  project: string | null;
  isAbsent: boolean;
  month: string;
}

interface Material {
  name: string;
  status: 'In Stock' | 'Out of Stock';
  quantity: number;
}

interface Project {
  id: number;
  name: string;
  deadline: string;
  progress: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const [activeLabourCount, setActiveLabourCount] = useState<number>(0);
  const [inStockCount, setInStockCount] = useState<number>(0);
  const [outOfStockCount, setOutOfStockCount] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [avgProgress, setAvgProgress] = useState<number>(0);

  useEffect(() => {
    const storedWorkers = localStorage.getItem('workers');
    if (storedWorkers) {
      try {
        const workers: Worker[] = JSON.parse(storedWorkers);
        const activeCount = workers.filter(
          (w) => w.status === 'available' || w.status === 'assigned'
        ).length;
        setActiveLabourCount(activeCount);
      } catch (error) {
        console.error('Error parsing workers:', error);
      }
    }
  }, []);

  useEffect(() => {
    const storedMaterials = localStorage.getItem('materials');
    if (storedMaterials) {
      try {
        const materials: Material[] = JSON.parse(storedMaterials);
        const inStock = materials.filter((m) => m.status === 'In Stock').length;
        const outOfStock = materials.filter((m) => m.status === 'Out of Stock').length;
        setInStockCount(inStock);
        setOutOfStockCount(outOfStock);
      } catch (error) {
        console.error('Error parsing materials:', error);
      }
    }
  }, []);

  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      try {
        const parsed: Project[] = JSON.parse(storedProjects);
        setProjects(parsed);
        const totalProgress = parsed.reduce((acc, p) => acc + p.progress, 0);
        const avg = parsed.length ? Math.round(totalProgress / parsed.length) : 0;
        setAvgProgress(avg);
      } catch (error) {
        console.error('Error parsing projects:', error);
      }
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Active Labour"
            count={activeLabourCount}
            icon={<Users className="text-blue-500" />}
          />
          <StatCard
            label="Materials In Stock"
            count={inStockCount}
            icon={<Box className="text-green-500" />}
          />
          <StatCard
            label="Materials Out of Stock"
            count={outOfStockCount}
            icon={<XCircle className="text-red-500" />}
          />
          <StatCard
            label="Avg. Project Progress"
            count={avgProgress}
            icon={<BarChart3 className="text-yellow-400" />}
            isPercentage
          />
        </div>

        {/* Project Progress Bars (Optional Top 3 projects) */}
        <div className="space-y-4">
          <h3 className="text-lg text-white font-semibold">Top Projects Overview</h3>
          {projects.slice(0, 3).map((project) => (
            <div key={project.id}>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>{project.name}</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-2 bg-netflix-gray rounded-full">
                <div
                  className="h-full bg-netflix-red rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bar Chart for all project deadlines */}
        {projects.length > 0 && <ProjectProgressChart projects={projects} />}
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({
  label,
  count,
  icon,
  isPercentage = false,
}: {
  label: string;
  count: number;
  icon: JSX.Element;
  isPercentage?: boolean;
}) => (
  <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
    <h3 className="text-white text-lg font-semibold flex items-center gap-2 mb-2">
      {icon}
      {label}
    </h3>
    <p className="text-3xl font-bold text-white">
      {count}
      {isPercentage && '%'}
    </p>
  </div>
);

export default Dashboard;
