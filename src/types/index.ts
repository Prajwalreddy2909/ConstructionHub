export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  location: string;
}

export interface Labour {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'assigned' | 'on-leave';
  assignedProject?: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  deadline: string;
  assignedLabour: string[];
  materials: Array<{
    materialId: string;
    quantity: number;
  }>;
}

export interface StateData {
  id: string;
  name: string;
  stockStatus: 'green' | 'yellow' | 'red';
  materials: Material[];
}