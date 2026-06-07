export interface EmployeeModel {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "agent" | "manager"; 
    department: string;     
    isActive: boolean;      
    lastLogin?: string;     
}