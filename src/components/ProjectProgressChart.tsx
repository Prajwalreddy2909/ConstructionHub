import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Project {
  id: number;
  name: string;
  deadline: string;
  progress: number;
}

interface Props {
  projects: Project[];
}

const ProjectProgressChart: React.FC<Props> = ({ projects }) => {
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const data = {
    labels: sortedProjects.map((p) => `${p.name} (${p.deadline})`),
    datasets: [
      {
        label: 'Progress (%)',
        data: sortedProjects.map((p) => p.progress),
        backgroundColor: 'rgba(229, 9, 20, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#fff',
        },
      },
      x: {
        ticks: {
          color: '#fff',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-netflix-dark p-6 rounded-lg mt-10" style={{ height: '400px' }}>
      <h3 className="text-white text-lg font-semibold mb-4">Project Progress by Deadline</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProjectProgressChart;
