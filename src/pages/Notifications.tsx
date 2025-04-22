import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useNotificationStore } from '../stores/notificationStore';

interface Notification {
  id: number;
  type: 'warning' | 'success' | 'info';
  message: string;
  time: string;
}

interface Project {
  id: number;
  name: string;
  deadline: string;
  progress: number;
  status: string;
}

interface Material {
  name: string;
  status: 'In Stock' | 'Out of Stock';
  quantity: number;
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<number[]>(() => {
    const savedRead = localStorage.getItem('readNotifications');
    try {
      const parsed = savedRead ? JSON.parse(savedRead) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [showAll, setShowAll] = useState(false);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  useEffect(() => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projects: Project[] = JSON.parse(storedProjects);
        if (Array.isArray(projects)) {
          projects.forEach((project) => {
            const createdAt = new Date(project.id);
            const timeDiff = now.getTime() - createdAt.getTime();
            if (timeDiff < 24 * 60 * 60 * 1000) {
              newNotifications.push({
                id: project.id + 1000,
                type: 'success',
                message: `New project added: ${project.name}`,
                time: 'Just now',
              });
            }

            const deadlineDate = new Date(project.deadline);
            const daysLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            if (daysLeft >= 0 && daysLeft <= 3) {
              newNotifications.push({
                id: project.id + 2000,
                type: 'warning',
                message: `Deadline approaching for ${project.name} (${Math.ceil(daysLeft)} days left)`,
                time: 'Today',
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error parsing projects for notifications:", error);
    }

    try {
      const storedMaterials = localStorage.getItem('materials');
      if (storedMaterials) {
        const materials: Material[] = JSON.parse(storedMaterials);
        if (Array.isArray(materials)) {
          materials.forEach((material, index) => {
            if (material.status === 'Out of Stock') {
              newNotifications.push({
                id: index + 3000,
                type: 'warning',
                message: `Out of stock: ${material.name}`,
                time: 'Today',
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error parsing materials for notifications:", error);
    }

    setNotifications(newNotifications);

    const savedRead = localStorage.getItem('readNotifications');
    const currentReadIds = savedRead ? JSON.parse(savedRead) : [];
    const unreadCount = newNotifications.filter(n => !currentReadIds.includes(n.id)).length;
    setUnreadCount(unreadCount);
  }, [setUnreadCount]);

  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;
    setUnreadCount(unreadCount);
  }, [readNotifications, notifications, setUnreadCount]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'info':
        return <Info className="text-blue-500" size={20} />;
      default:
        return null;
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifications(allIds);
  };

  const handleMarkAsRead = (id: number) => {
    if (!readNotifications.includes(id)) {
      setReadNotifications(prev => [...prev, id]);
    }
  };

  const handleViewAll = () => {
    setShowAll((prev) => !prev);
  };

  const filteredNotifications = showAll
    ? notifications
    : notifications.filter((n) => !readNotifications.includes(n.id));

  const currentUnreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            {currentUnreadCount > 0 && (
              <span className="bg-netflix-red text-white text-sm px-2 py-1 rounded-full">
                {currentUnreadCount} New
              </span>
            )}
          </div>
          {currentUnreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications generated yet.</p>
          ) : filteredNotifications.length === 0 && !showAll ? (
            <p className="text-gray-400 text-sm">No new notifications.</p>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-netflix-dark p-6 rounded-lg flex items-start gap-4 ${readNotifications.includes(notification.id) ? 'opacity-60' : ''}`}
              >
                {getIcon(notification.type)}
                <div className="flex-1">
                  <p className="text-white">{notification.message}</p>
                  <span className="text-gray-400 text-sm">{notification.time}</span>
                </div>
                {!readNotifications.includes(notification.id) && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Mark as read"
                  >
                    <Bell size={20} />
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleViewAll}
              className="text-netflix-red hover:text-red-700 transition-colors text-sm"
            >
              {showAll ? 'Hide Read Notifications' : 'View Read Notifications'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
